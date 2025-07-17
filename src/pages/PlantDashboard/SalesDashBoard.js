import React from 'react'
import { SalesStats } from './SalesStats'


const SalesDashBoard = () => {
    return (
        <>
            <h1 style={{
                marginLeft: '2.5rem',
            }}>Sales Dashboard</h1>

            <div style={{
                width: '100%',
                height: '400px',
            }}>
                <SalesStats />
            </div>
        </>
    )
}

export { SalesDashBoard }