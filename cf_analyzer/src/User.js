import React from 'react';
import { useLocation } from 'react-router-dom';
import './User.css';
import { Chart } from "react-google-charts";

const User = () => {

  const location = useLocation();
  const problemsData = location.state.problems;
  const userName = location.state.name;

  const DataGraph = (data) =>{
    const problem = data.data.problemId + 65;
    const Tag = String.fromCharCode(problem);;

    return (
      <div className='dataGraph'>
        <div>
          <Chart
            chartType="PieChart"
            data={[["Type of Submissions", "Count"], ["Correct Submissions", data.data.cntAC], ["Incorrect Submissions", data.data.cntWA]]}
            width="100%"
            height="400px"
          />
        </div>
      </div>
    );
  }

  const DataTable = (data) =>{

    const problem = data.data.problemId + 65;
    const Tag = String.fromCharCode(problem);
    const accuracy = (data.data.accuracy).toFixed(2);

    return (
      <div className='dataTable'>
        <h3>{Tag}</h3>

        <div>
          <span>No of Submissions : <b>{data.data.cntSubmission}</b></span>
        </div>

        <div>
          <span>No of Correct Submissions : <b>{data.data.cntAC}</b></span>
        </div>

        <div>
          <span>No of Incorrect  Submissions : <b>{data.data.cntWA}</b></span>
        </div>

        <div>
          <span>Correctness Accuracy : <b>{accuracy}</b></span>
        </div>

        <div>
          <span>Fastest Submission Time Taken : <b>{data.data.fastestSubmission.submitTime}</b> minutes</span>
        </div>

        <div>
          <span>Slowest Submission Time Taken : <b>{data.data.slowestSubmission.submitTime}</b> minutes</span>
        </div>

        <div>
          <span>Max Rated Problem's Rating : <b>{data.data.maxRatedProblem.rating}</b></span>
        </div>
      </div>
    );
  }

  return (
    <div className='UserMainPart'>
        <div className='HomeNavPart'>
            <p id='first'>{userName}</p>
        </div>

        <div className='UserDataContent'>
          <div className='UserDataTable'>
            {problemsData.map((data) => <DataTable data={data}/>)}
          </div>

          <div className='UserDataGraph'>
          {problemsData.map((data) => <DataGraph data={data}/>)}
          </div>
        </div>

    </div>
  )
}

export default User