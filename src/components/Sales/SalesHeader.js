import React, { useState, useRef, useEffect } from "react";
import styles from "./Sales.module.css";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { Card, CardHeader, CardContent, LinearProgress } from "@mui/material";
import { Table } from "../../components";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import ProfitIcon from "../../icons/ProfitIcon";
import LossIcon from "../../icons/LossIcon";
import RupeeIcon from "../../icons/RupeeIcon";
import InvestmentIcon from "../../icons/InvestmentIcon";
import SalesIcon from "../../icons/SalesIcon";
import WastageIcon from "../../icons/WastageIcon";
import PaymentsIcon from "../../icons/PaymentsIcon";
import InventoryIcon from "../../icons/InventoryIcon";
import ProfitIons from "../../icons/ProfitIons";
import PlantIcon from "../../icons/PlantIcon";
const SalesHeader = ({
  cardData,
  selectedPlants,
  graphsData,
  selectedCategory,
}) => {
  const [filteredData, setFilteredData] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const headerData = [
    {
      title: "Investment",
      price: cardData?.investment,
      percentage:cardData?.investment_perecntage,
      icon: (status) => <InvestmentIcon status={status} />, 
    },
    {
      title: "Sales",
      price: cardData?.sales,
      percentage: cardData?.totalSales_perecntage,
      icon: (status) => <SalesIcon status={status} />, 
    },
    {
      title: "Wastages",
      price: cardData?.damages,
      percentage: cardData?.saleQuantity_perecntage,
      icon: (status) => <WastageIcon status={status} />, 
    },
    {
      title: "Profit",
      price: cardData?.profit,
      percentage: cardData?.profit_perecntage,
      icon: (status) => <ProfitIons status={status} />, 
    },
    {
      title: "Payments",
      price: cardData?.damages,
      percentage: cardData?.payments_perecntage,
      icon: (status) => <PaymentsIcon status={status} />, 
    },
    {
      title: "Inventory",
      price: cardData?.profit,
      // percentage: 10,
      icon: (status) => <InventoryIcon status={status} />, 
    },
  ];

  const handleCardClick = (index, item) => {
    console.log(item, "==item");
    setSelectedCard(item);
    setSelectedTitle(item?.title.toLowerCase());
    if (graphsData.length > 0) {
      const clickedData = graphsData.data.filter(
        (item) => item?.title.toLowerCase() in item
      );
      setFilteredData(clickedData);
    }
  };
  let variantsData = cardData?.variants;
  let salesData = cardData?.plants;
  const TABLE_HEADER = [
    {
      value: "Variant",
      isSortable: false,
    },
    {
      value: "Sold Units",
      isSortable: false,
    },
    {
      value: "Percentage",
      isSortable: false,
    },
    {
      value: "Variant Sales",
      isSortable: false,
    },
  ];
  const TABLE_HEADER1 = [
    {
      value: "Plant Name",
      isSortable: false,
    },
    {
      value: "Sales",
      isSortable: false,
    },
    {
      value: "Investments",
      isSortable: false,
    },
    {
      value: "Wastages",
      isSortable: false,
    },
    {
      value: "Profit",
      isSortable: false,
    },
    {
      value: "Profit%",
      isSortable: false,
    },
    {
      value: "Under Maintenece",
      isSortable: false,
    },
  ];

  let variantsTableData = [];
  if (variantsData !== undefined) {
    variantsTableData = variantsData?.map((item) => [
      { value: item?._id?.en?.name },
      { value: item?.quantity },
      {
        value: (
          <div className="d-flex align-items-center">
            <span className="mr-2">
              {`${((item?.quantity * item?.saleAmount) / 100).toFixed(2)}%`}
            </span>
            <LinearProgress
              variant="determinate"
              value={(item?.quantity * item?.saleAmount) / 100}
            />
          </div>
        ),
      },
      { value: item?.saleAmount },
    ]);
  }
  let plantsData = [];
  if (salesData !== undefined) {
    plantsData = salesData?.map((item) => [
      { value: item?.names.en.name },
      { value: item?.sales },
      { value: item?.investment },
      { value: item?.damages },
      { value: item?.profit },
      { value: item?.profitPercentage },
      { value: item?.underMaintenanceQuantity },
    ]);
  }
  console.log(variantsTableData, "===variantsTableData");

  const chartRef = useRef(null);
  useEffect(() => {
    let modifiedLabels;
    const ctx = document.getElementById("salesChart");
    if (graphsData !== undefined) {
      modifiedLabels = graphsData?.data?.map((item) => {
        const month = item?.month < 10 ? `0${item.month}` : item.month;
        return `${month}`;
      });
    }

    if (ctx) {
      let selectedData = [];
      if (selectedTitle) {
        selectedData = graphsData?.data?.map((item) => item[selectedTitle]);
      }

      chartRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: modifiedLabels,
          datasets: [
            {
              label: `${selectedCard ? selectedCard?.title : "No data"} `,
              fill: false,
              borderColor: "#4CD964",
              data: selectedData,
              lineTension: 0.2,
            },
          ],
        },
        options: {
          scales: {
            x: {
              type: "category",
              ticks: {
                color: "#000", 
              },
            },
            y: {
              ticks: {
                color: "#000",
              },
            },
          },
          responsive: true,
        },
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [filteredData, selectedTitle]);

  return (
    <>
      <div>
        <Box sx={{ width: "100%" }}>
          <Grid
            container
            rowSpacing={1}
            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
            item
            xs={12}
          >
            {headerData.map((item, index) => (
              <Grid item xs={2} key={index}>
                <div
                  className={`${styles.col} ${
                    selectedCard?.title === item?.title ? styles.selectedCard : ""
                  }`}
                  onClick={() => handleCardClick(index, item)}
                >
                  <div className={`${styles.cols} ${item.title === "Inventory" ? styles.inventorycard : ""}`}>
                    <div className={styles.cardTitle}>
                      <span className={`${styles.cardtit} " poppins " ${
                         selectedCard?.title === item?.title ? styles.selectedCardtit : ""
                      }`}>
                        {item.title}
                      </span>
                    </div>
                    <div className={styles.iconShape}>
                      <span>{item.icon(selectedCard?.title === item?.title)}</span>
                    </div>
                  </div>
                  <div className={styles.ratesicons}> 
                    <div style={{"padding-top":"5px"}}>
                      {item.title === "Wastages" || item.title === "Inventory" ? <span><PlantIcon/></span> : <span><RupeeIcon/></span>}  
                      
                    </div>
                    <div>
                    {
                      item?.price ? <span className={styles.salespr}>{item.price}</span> :""
                    }
                    
                  </div>
                  </div>

                 
                  <div className={styles.percent}>
                    <div className={styles.ratiopercent}>
                      {item.percentage  && item.percentage > 0  && item.price !==0? (
                        <>
                         {item.title === "Inventory" ? " ": <ProfitIcon /> }
                        </>
                      ) : (
                        <>
                         {item.title === "Inventory" ? " ": <LossIcon /> }
                        </>
                      )}
                    </div>
                    <div>
                      <span className={item.percentage && item.percentage > 0 ? styles.profittext : styles.losstext}>{item?.percentage?.toFixed(2)}{item.title === "Inventory" ? " " : "%"}</span>
                    </div>

                  </div>
                </div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </div>
      <div className={styles.graphsdataa}>
        <Grid container spacing={4} item xs={12}>
          <Grid item xl={6} xs={6}>
            <Card className={`${styles.bg_gradient_default} ${styles.shadow}`}>
              <CardHeader >
                <span style={{color:"red"}}>{selectedCard?.icon} hello</span>
              </CardHeader>
              <CardContent>
                <div className={styles.chart}>
                  <canvas id="salesChart" />
                </div>
              </CardContent>
            </Card>
          </Grid> 

          {(selectedCategory &&
            selectedPlants.length === 0 &&
            selectedCategory.length === 1) ||
          (selectedPlants.length === 0 && selectedCategory.length === 0) ||
          (selectedPlants &&
            selectedCategory.length === 0 &&
            selectedPlants.length === 1) ? (
            // YourComponent.js
            <Grid item xl={6} xs={6} className = " grid7 ">
              <Card
                className={styles.shadow}
                style={{ height: "370px", overflowY: "auto" }}
              >
                <div className={styles.variants}>
                  <h1 className={`${styles.var1} ${styles.tableHeader} " poppins "` }>
                    Variant Sales
                  </h1>
                </div>
                <Table data={[TABLE_HEADER, ...variantsTableData]} />
              </Card>
            </Grid>
          ) : (
            " "
          )}

          <Grid
            container
            spacing={2}
            item
            xs={12}
            style={{ "margin-bottom": "40px" }}
          >
            <Grid item xl={6} xs={6} className=" grid7 ">
              <Card
                style={{ height: "400px", overflowY: "auto" }}
                className={styles.shadow}
              >
                <div className={styles.variants}>
                  <h1 className={styles.var1 + " poppins "}>Variant Sales</h1>
                </div>
                <Table data={[TABLE_HEADER1, ...plantsData]} />
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default SalesHeader;
