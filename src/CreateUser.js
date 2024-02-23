import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { CSVLink } from "react-csv";

const CreateUser = () => {
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(10);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NDk0NzM2ZWUwNjE1ZWY2Mzc3MjU2MyIsIm5hbWUiOiJhZG1pbjEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDg2NzE1NDUsImV4cCI6MTcwODc1Nzk0NX0.fY3ZfvsXtKSm49-IJFsarmCJUu5jriUIVnvq4sLifcE';
  const baseUrl = 'http://15.207.187.17:8000'; // Replace this with your actual base URL

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = {
        Authorization: `${token}`,
      };

      const response = await axios.get(`${baseUrl}/api/excel/billing?pageNumber=1&startDate=2023-01-01&endDate=2024-02-02`, { headers, responseType: 'arraybuffer' });

      const workbook = XLSX.read(response.data, { type: 'array' });
      // const outputName = `output.xlsx`;
      // XLSX.writeFile(workbook, outputName);

      // Convert the fetched data to a format that can be displayed in a table
      const tableData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

      // Set only the first 10 items from the tableData array to the data state
      setData(tableData.slice(startIndex, endIndex));
      setStartIndex((prevIndex) => prevIndex + 10)
      setEndIndex((prevIndex) => prevIndex + 10)
      console.log(startIndex, endIndex)
      console.log(data)
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
       
        fetchData()
       
  }, [])

  return (
    <div>
      <h1>Excel Data Downloader</h1>
      <CSVLink onClick={fetchData} data={data}>Download me</CSVLink>;
      {loading && <p>Loading...</p>}
      {data.length > 0 && (
        <>
          <h2>Fetched Data:</h2>
          <table>
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, index) => (
                    <td key={index}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default CreateUser;
