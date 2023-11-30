import React, { useState } from 'react';
import './Home.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {

    const [userId,setUserId] = useState('');
    const [startDate,setStartDate] = useState(null);
    const [endDate,setEndDate] = useState(null);

    const navigate = useNavigate();

    function handleSubmit(){
        if(userId.length === 0){
            alert('Enter User Id');
            return;
        }
        if(startDate === null){
            alert('Enter Start Date');
            return;
        }
        if(endDate === null){
            alert('Enter End Date');
            return;
        }
        if(startDate > endDate){
            alert('Enter Correct Date Range');
            return;
        }

        class timeProblem // this is used in storing fastest & slowest submission {time, contestID} so that link can be provided to user
        {
            contructor(submitTime = 0, contestID = "") {
                this.submitTime = submitTime;
                this.contestID = contestID;
                this.hii=0;
            }
        }
        class RatingProblem { // this is used in storing max rated problem {rating, contestID}
            contructor(rating = 0, contestID = "") {
                this.rating = rating;
                this.contestID = contestID;
            }
        }

        class ProblemAnalysis {
            constructor(cntSubmission = 0, cntAC = 0, sumSubmitTime = 0, fastestSubmission = new timeProblem(), slowestSubmission = new timeProblem(), maxRatedProblem = new RatingProblem()) {
                this.cntSubmission = cntSubmission;
                this.cntAC = cntAC;
                this.sumSubmitTime = sumSubmitTime;
                this.fastestSubmission = fastestSubmission;
                this.fastestSubmission.submitTime = Infinity;
                this.slowestSubmission = slowestSubmission;
                this.slowestSubmission.submitTime = 0;
                this.maxRatedProblem = maxRatedProblem;
                this.maxRatedProblem.rating = 0;
                this.cntWA = 0;
                this.percentTimeSolved = 0;
                this.accuracy = 0;
                this.avgTime = 0;
                this.problemId = 0;
            }
            countWA() {
                return this.cntSubmission - this.cntAC;
            }
            calculatePercentTimeSolved(cntContest) {
                return (this.cntAC / cntContest) * 100;
            }
            calculateAccuracy() {
                return (this.cntAC / this.cntSubmission) * 100;
            }
            calculateAvgTime() {
                return (this.sumSubmitTime / this.cntAC);
            }
            updateOtherThings(cntContest) {
                if(this.cntSubmission === 0)
                return;
                this.cntWA = this.countWA();
                this.percentTimeSolved = this.calculatePercentTimeSolved(cntContest);
                this.accuracy = this.calculateAccuracy();
                if(this.cntAC === 0)
                {
                    this.fastestSubmission.submitTime = -1;
                    this.slowestSubmission.submitTime = -1;
                    this.maxRatedProblem.rating = -1;
                    this.avgTime = 0;
                }
                else
                {
                    this.avgTime = Math.floor(this.calculateAvgTime()/60);
                    this.fastestSubmission.submitTime = Math.floor(this.fastestSubmission.submitTime/60);
                    this.slowestSubmission.submitTime = Math.floor(this.slowestSubmission.submitTime/60);
                }
            }
        }

        class generalStats {
            constructor(maxDelta = new RatingProblem(), minDelta = new RatingProblem(), bestRank = new RatingProblem(), worstRank = new RatingProblem()) {
                this.totalContests = 0;
                this.bestRank = bestRank;
                this.bestRank.rating = Infinity;
                this.worstRank = worstRank;
                this.worstRank.rating = -Infinity;
                this.averageRank = 0;
                this.averageProblemSolved = 0;
                this.totalDelta = 0;
                this.maxDelta = maxDelta;
                this.maxDelta.rating = -Infinity;
                this.minDelta = minDelta;
                this.minDelta.rating = Infinity;
            }

            addContest = (rank, delta, contestId, cnt) => {
                this.averageRank = (this.averageRank) * (this.totalContests) + rank;
                this.averageProblemSolved = (this.averageProblemSolved) * (this.totalContests) + cnt;
                
                this.totalContests++;
                this.averageRank /= this.totalContests;
                this.averageProblemSolved /= this.totalContests;
                
                this.totalDelta += delta;
                if (this.maxDelta.rating < delta) {
                    this.maxDelta.rating = delta;
                    this.maxDelta.contestID = contestId;
                }
                if (this.minDelta.rating > delta) {
                    this.minDelta.rating = delta;
                    this.minDelta.contestID = contestId;
                }
                if (this.bestRank.rating > rank) {
                    this.bestRank.rating = rank;
                    this.bestRank.contestID = contestId;
                }
                if (this.worstRank.rating < rank) {
                    this.worstRank.rating = rank;
                    this.worstRank.contestID = contestId;
                }
            }
        }

        let problems = [];
        let general = new generalStats();

        function resetArray() {
            problems = [];
            general = new generalStats();
            for (let i = 0; i < 10; i++) {
                problems[i] = new ProblemAnalysis();
            }
        }

        function findIndex(index) {
            let ans;
            switch (index) {
                case "A":
                    ans = 0;
                    break;
                case "B":
                    ans = 1;
                    break;
                case "C":
                    ans = 2;
                    break;
                case "D":
                    ans = 3;
                    break;
                case "E":
                    ans = 4;
                    break;
                case "F":
                    ans = 5;
                    break;
                case "G":
                    ans = 6;
                    break;
                case "H":
                    ans = 7;
                    break;
                case "I":
                    ans = 8;
                    break;
                case "J":
                    ans = 9;
                    break;
                default :
                    ans = -1;
            }
            return ans;
        }

        function timeAnalysis(result, lowerTime, upperTime, problems) {
            result.forEach((submission) => {
                if (submission.creationTimeSeconds >= lowerTime && submission.creationTimeSeconds <= upperTime && submission.author.participantType === "CONTESTANT") {
                    const index = submission.problem.index.substring(0, 1);
                    const i = findIndex(index);
                    if(i >= 0)
                    {
                        problems[i].cntSubmission += 1;
                        if (submission.verdict === "OK") {
                            problems[i].cntAC++;
                            problems[i].sumSubmitTime += submission.relativeTimeSeconds;
                            if (submission.relativeTimeSeconds < problems[i].fastestSubmission.submitTime) {
                                problems[i].fastestSubmission.submitTime = submission.relativeTimeSeconds;
                                problems[i].fastestSubmission.contestID = submission.author.contestId;
                            }
                            if (submission.relativeTimeSeconds > problems[i].slowestSubmission.submitTime) {
                                problems[i].slowestSubmission.submitTime = submission.relativeTimeSeconds;
                                problems[i].slowestSubmission.contestID = submission.author.contestId;
                            }
                            if (submission.problem.rating > problems[i].maxRatedProblem.rating) {
                                problems[i].maxRatedProblem.rating = submission.problem.rating;
                                problems[i].maxRatedProblem.contestID = submission.author.contestId;
                            }
                        }
                    }
                }
            });
        }

        const generalAnalysis = (result, ratingResult, lowerTime, upperTime, general) => {
            let contestIds = new Map();
            result.forEach((submission) => {
                if (submission.author.participantType === "CONTESTANT" && submission.author.startTimeSeconds >= lowerTime && submission.author.startTimeSeconds <= upperTime) {
                    if(!contestIds.has(submission.contestId))
                    contestIds.set(submission.contestId, 0);
                    if(submission.verdict === "OK")
                    {
                        let cnt = contestIds.get(submission.contestId);
                        cnt++;
                        contestIds.set(submission.contestId, cnt);
                    }
                }
            })
            ratingResult.forEach((contest) => {
                if (contestIds.has(contest.contestId)) {
                    let cnt = contestIds.get(contest.contestId);
                    general.addContest(contest.rank, contest.newRating - contest.oldRating, contest.contestId, cnt);
                }
            })
        }

        async function getUser(url) {
            try {
                const response = await axios.get(url);
                return response;
            } catch (error) {
                throw error
            }
        }

        async function analysis() {
            resetArray();
            let handle = userId;
            try {
                
                let stDate =parseInt((new Date(startDate).getTime() / 1000).toFixed(0));
                let enDate =parseInt((new Date(endDate).getTime() / 1000).toFixed(0));
            
                const url = "https://codeforces.com/api/user.status?handle=" + handle;
                const ratingUrl = "https://codeforces.com/api/user.rating?handle=" + handle;
            
                let submissionData = await getUser(url);
                let result = submissionData.data.result;
                timeAnalysis(result, stDate, enDate, problems);
                // console.log(problems);
            
                let ratingData = await getUser(ratingUrl);
                ratingData = ratingData.data.result
                generalAnalysis(result, ratingData, stDate, enDate, general)
                // console.log(general)
                let ind = 0;
                problems.forEach((problem)=>{
                    problem.updateOtherThings(general.totalContests);
                    problem.problemId = ind;
                    ind++;
                });
                console.log(problems);
                navigate('/user', {state:{problems:problems, name:userId}});
            
                // res.render('analysis', { handle, display: 1, problems, general,alert:"" })
            } catch (error) {
                if(!error || !error.response || !error.response.data || !error.response.data.comment){
                    console.log("error occured")
                    return;
                }
                let e=error.response.data
                alert(e.comment);
            }
        }

        analysis();
    }

    return (
        <div className='HomeMainPart'>
            <div className='HomeNavPart'>
                <p id='first'>CodeForces Contest </p><p id='second'>Analyzer</p>
            </div>
            <div className='SearchPart'>
                <div>
                    <div className='upperSearch'>
                        <input onChange={(e)=>setUserId(e.target.value)} type='text' placeholder='Search User  @cf_analyzer '/>
                    </div>
                    <div className='lowerSearch'>
                        <div className='DateInput'>
                            <div className='DateInputBox'>
                                <input onChange={(e)=>setStartDate(e.target.value)} type='date'/>
                            </div>
                            <div className='DateInputBox'>
                                <input onChange={(e)=>setEndDate(e.target.value)} type='date'/>
                            </div>
                        </div>
                        <div className='submitBtn'>
                            <button onClick={handleSubmit}>Submit</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className='creatorPart'>
                <p>Creators :</p>
                <p id='mansi'>Mansi Agarwal</p>
                <p id='jayash'>Jayash Todi</p>
            </div>
        </div>
    )
}

export default Home