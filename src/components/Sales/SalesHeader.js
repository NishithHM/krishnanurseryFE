import React, { useState, useRef, useEffect } from "react";
import styles from "./Sales.module.css";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import {
  Card,
  CardHeader,
  CardContent,
  LinearProgress,
} from "@mui/material";
import { Table } from "../../components";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
const SalesHeader = ({ cardData, selectedPlants, graphsData,selectedCategory }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const headerData = [
    { title: "Investment", price: cardData?.investment, percentage: 8 },
    { title: "Sales", price: cardData?.sales, percentage: 8 },
    { title: "Wastages", price: cardData?.damages, percentage: 9 },
    { title: "Profit", price: cardData?.profit, percentage: 10 },
    { title: "Payments", price: cardData?.damages, percentage: 9 },
    { title: "Inventory", price: cardData?.profit, percentage: 10 },
  ];

  const handleCardClick = (index) => {
    setSelectedCard(index);
    const clickedTitle = headerData[index]?.title.toLowerCase();
    setSelectedTitle(clickedTitle);
    if (graphsData.length > 0) {
      const clickedData = graphsData.data.filter(
        (item) => clickedTitle in item
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
            <span className="mr-2">{`${((item?.quantity * item?.saleAmount) / 100).toFixed(2)}%`}
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
    if(graphsData !== undefined) {
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
              label: `${selectedTitle} data`,
              fill: false,
              borderColor: "rgba(75,192,192,1)",
              data: selectedData,
              lineTension: 0.2,
            },
          ],
        },
        options: {
          scales: {
            x: {
              type: "category",
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
              <Grid item xs={3} key={index}>
                <div
                  className={`${styles.col} ${
                    selectedCard === index ? styles.selectedCard : ""
                  }`}
                  onClick={() => handleCardClick(index)}
                >
                  <div className={styles.cols}>
                    <div className={styles.cardTitle}>
                      <span className={styles.cardtit}>{item.title}</span>
                    </div>
                    <div className={styles.iconShape}>
                      <input
                        type="radio"
                        checked={selectedCard === index}
                        className={styles.radiobut}
                      />
                    </div>
                  </div>
                  <div>
                    <span className={styles.salespr}>{item.price}</span>
                  </div>
                  <div className={styles.percent}>
                    <div className={styles.ratiopercent}>
                      | <span>{item.percentage}%</span>{" "}
                    </div>
                    <div className={styles.dater}>
                      <span className={styles.ranges}>Date range</span>
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
          <Grid
            item
            xl={8}
            xs={7}
            className={`${styles.mb_5} ${styles.mb_xl_0}`}
          >
            <Card className={`${styles.bg_gradient_default} ${styles.shadow}`}>
              <CardHeader className={styles.bg_transparent}>
              </CardHeader>
              <CardContent>
                <div className={styles.chart}>
                  <canvas id="salesChart" />
                </div>
              </CardContent>
            </Card>
          </Grid>

          { (selectedCategory && selectedPlants.length === 0  && selectedCategory.length === 1 || selectedPlants.length === 0  && selectedCategory.length === 0) || (selectedPlants && selectedCategory.length === 0 && selectedPlants.length === 1) 
           ? (
            <Grid item xl={4} xs={5}>
              <Card
                className="shadow"
                style={{ height: "370px", overflowY: "auto" }}
              >
                <div className={styles.variants}>
                  <h1 className={styles.var1}>Variant Sales</h1>
                </div>
                <Table data={[TABLE_HEADER, ...variantsTableData]} />
              </Card>
            </Grid>
          ) : (
            " "
          )}

          <Grid container spacing={2} item xs={12} style={{"margin-bottom":"40px"}}>
            <Grid item xl={8} xs={7} className="mb-5 mb-xl-0">
              <Card
                className="shadow"
                style={{ height: "400px", overflowY: "auto" }}
              >
                <div className={styles.variants}>
                  <h1 className={styles.var1}>Variant Sales</h1>
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
