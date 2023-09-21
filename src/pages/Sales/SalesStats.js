import React from "react";
import styles from "./Sales.module.css";

import { Chart } from "../../components/Chart/Chart";
import { repeat } from "lodash";

const dummyChartData = [
    {
        id: "japan",
        color: "hsl(5, 70%, 50%)",
        data: [
            {
                x: "plane",
                y: 208,
            },
            {
                x: "helicopter",
                y: 41,
            },
            {
                x: "boat",
                y: 174,
            },
            {
                x: "train",
                y: 10,
            },
            {
                x: "subway",
                y: 191,
            },
            {
                x: "bus",
                y: 186,
            },
            {
                x: "car",
                y: 286,
            },
            {
                x: "moto",
                y: 64,
            },
            {
                x: "bicycle",
                y: 88,
            },
            {
                x: "horse",
                y: 20,
            },
            {
                x: "skateboard",
                y: 28,
            },
            {
                x: "others",
                y: 113,
            },
        ],
    },
    {
        id: "france",
        color: "hsl(136, 70%, 50%)",
        data: [
            {
                x: "plane",
                y: 295,
            },
            {
                x: "helicopter",
                y: 229,
            },
            {
                x: "boat",
                y: 181,
            },
            {
                x: "train",
                y: 168,
            },
            {
                x: "subway",
                y: 133,
            },
            {
                x: "bus",
                y: 258,
            },
            {
                x: "car",
                y: 146,
            },
            {
                x: "moto",
                y: 257,
            },
            {
                x: "bicycle",
                y: 139,
            },
            {
                x: "horse",
                y: 110,
            },
            {
                x: "skateboard",
                y: 63,
            },
            {
                x: "others",
                y: 147,
            },
        ],
    },
    {
        id: "us",
        color: "hsl(199, 70%, 50%)",
        data: [
            {
                x: "plane",
                y: 17,
            },
            {
                x: "helicopter",
                y: 156,
            },
            {
                x: "boat",
                y: 67,
            },
            {
                x: "train",
                y: 121,
            },
            {
                x: "subway",
                y: 285,
            },
            {
                x: "bus",
                y: 68,
            },
            {
                x: "car",
                y: 36,
            },
            {
                x: "moto",
                y: 180,
            },
            {
                x: "bicycle",
                y: 121,
            },
            {
                x: "horse",
                y: 146,
            },
            {
                x: "skateboard",
                y: 115,
            },
            {
                x: "others",
                y: 46,
            },
        ],
    },
    {
        id: "germany",
        color: "hsl(170, 70%, 50%)",
        data: [
            {
                x: "plane",
                y: 70,
            },
            {
                x: "helicopter",
                y: 284,
            },
            {
                x: "boat",
                y: 48,
            },
            {
                x: "train",
                y: 86,
            },
            {
                x: "subway",
                y: 12,
            },
            {
                x: "bus",
                y: 120,
            },
            {
                x: "car",
                y: 227,
            },
            {
                x: "moto",
                y: 169,
            },
            {
                x: "bicycle",
                y: 224,
            },
            {
                x: "horse",
                y: 166,
            },
            {
                x: "skateboard",
                y: 102,
            },
            {
                x: "others",
                y: 103,
            },
        ],
    },
    {
        id: "norway",
        color: "hsl(189, 70%, 50%)",
        data: [
            {
                x: "plane",
                y: 39,
            },
            {
                x: "helicopter",
                y: 189,
            },
            {
                x: "boat",
                y: 58,
            },
            {
                x: "train",
                y: 194,
            },
            {
                x: "subway",
                y: 72,
            },
            {
                x: "bus",
                y: 294,
            },
            {
                x: "car",
                y: 165,
            },
            {
                x: "moto",
                y: 283,
            },
            {
                x: "bicycle",
                y: 133,
            },
            {
                x: "horse",
                y: 91,
            },
            {
                x: "skateboard",
                y: 205,
            },
            {
                x: "others",
                y: 115,
            },
        ],
    },
];

const SalesStats = () => {
    return (
        <>  
            <div
                style={{
                    margin: '1rem',
                    placeItems: 'center',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6,1fr)',
                    gridTemplateRows: 'repeat(3,1fr)',
                }}
            >
                <div style={{

                    gridColumn: '1/4',
                    gridRow: '1/3',
                    height: '300px',
                    width: '100%',
                }}>
                    <Chart data={dummyChartData} />
                </div>
                <SalesStatsBox name='Investment' value={10000} />
                <SalesStatsBox name='Investment' value={10000} />
                <SalesStatsBox name='Investment' value={10000} />
                <SalesStatsBox name='Investment' value={10000} />
                <SalesStatsBox name='Investment' value={10000} />
                <SalesStatsBox name='Investment' value={10000} />
            </div>
        </>
    );
};

const SalesStatsBox = ({ name, value }) => {

    return <>
        <div style={{
            background: 'white',
            boxShadow: '0 0 10px rgba(0,0,0,0.2)',
            border: '1px solid black',
            borderRadius: '3px',
            color: 'black',
            fontWeight: 'bold',
            padding: '1.4rem',
        }}>
            <div style={{
                paddingBottom: '.4rem',
                fontSize: '1.2rem',
                fontWeight: 'bolder',
            }}>{name}</div>
            <div>{value}</div>
        </div>
    </>

}


export { SalesStats };
