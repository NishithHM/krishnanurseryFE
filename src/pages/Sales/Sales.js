import React, { useEffect, useState, useCallback } from "react";
import Container from "@mui/material/Container";
import SalesHeader from "../../components/Sales/SalesHeader";
import Dropdown from "../../components/Dropdown/Dropdown";
import Grid from "@mui/material/Grid";
import dayjs from "dayjs";
import {
  useGraphDataMutation,
  useMetaDataMutation,
} from "../../services/sales.services";
import Datefilter from "../../components/Filters/Datefilter";
import styles from "../../components/Sales/Sales.module.css";
import { BackButton } from "../../components";

const Sales = () => {
  const [metaData, { data }] = useMetaDataMutation();
  const [graphData] = useGraphDataMutation();
  const [cardData, setCardData] = useState(null);
  const [graphsData, setGraphsData] = useState(null);
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
// const [selectdate ,setSelectDate] =useState(false)
  const defaultStartDate = dayjs().subtract(1, 'year').format('YYYY-MM-DD');
  const defaultEndDate = dayjs().format('YYYY-MM-DD');

  const [dateRange, setDateRange] = useState({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  });

  const handlePlantChange = useCallback((selectedPlants) => {
    setSelectedPlants(selectedPlants);
    setSelectedCategory([]);
  }, [selectedPlants]);

  const handleCategoryChange = useCallback((selectedCategories) => {
    setSelectedCategory(selectedCategories);
    setSelectedPlants([]);
  }, [selectedCategory]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await metaData({
          body: {
            ...dateRange,
            plants: selectedPlants.map((plant) => plant.value),
            categories: selectedCategory.map((category) => category.value),
          },
        });
        const res1 = await graphData({
          body: {
            ...dateRange,
            plants: selectedPlants.map((plant) => plant.value),
            categories: selectedCategory.map((category) => category.value),
          },
        });
        if (res1) {
          setGraphsData(res1);
        }
        if (res) {
          setCardData(res?.data);
        }
      } catch (error) {
        console.error("Sales Data Fetch Error:", error);
      }
    };
    fetchData();
  }, [dateRange, selectedPlants, selectedCategory]);

  const handleDateChange = useCallback((selectedDate) => {
    if (selectedDate && selectedDate.startDate && selectedDate.endDate) {
      // setSelectDate(true);
      const formattedStartDate = dayjs(selectedDate.startDate).format("YYYY-MM-DD");
      const formattedEndDate = dayjs(selectedDate.endDate).format("YYYY-MM-DD");

      const plantsArray = selectedPlants || [];
      const categoriesArray = selectedCategory || [];

      setDateRange({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        plants: plantsArray.map((plant) => plant.value),
        categories: categoriesArray.map((category) => category.value),
      });
    } else {
      console.error("Invalid selectedDate object:", selectedDate);
    }
  }, []);

  return (
    <div>
      <div>
        <BackButton navigateTo={"/authorised/dashboard"} />
      </div>
      <Container maxWidth="xl" className=" containermax ">
        <div>
          <h1 className={styles.dash + " poppins "}>Admin Dashboard</h1>
        </div>
        <div>
          <div>
            <Grid container spacing={2} item xs={12}>
              <Grid item xs={4} className="plants">
                <Dropdown
                  url="/api/procurements/getAll?isList=true&isAll=true"
                  id="addPlantName"
                  apiDataPath={{ label: "names.en.name", value: "_id" }}
                  title="Plants"
                  onChange={handlePlantChange}
                  value={selectedPlants}
                  required
                  isMultiEnabled
                  isDisabled={selectedCategory.length > 0}
          
          
                  minInputToFireApi={3}
                />
              </Grid>
              <Grid item xs={4} className="datefilters">
                <Datefilter
                  onChange={handleDateChange}
                  startDateInput={dateRange.startDate}
                  endDateInput={dateRange.endDate}
                  defaultStartDate ={defaultStartDate}
                  defaultEndDate ={defaultEndDate}
                />
              </Grid>
              <Grid item xs={4} className="plants">
                <Dropdown
                  url="/api/category/getAll"
                  id="addCategory"
                  apiDataPath={{ label: "names.en.name", value: "_id" }}
                  title="Category"
                  onChange={handleCategoryChange}
                  value={selectedCategory}
                  required
                  isMultiEnabled
                  minInputToFireApi={3}
                  isDisabled={selectedPlants.length > 0}
                />
              </Grid>
            </Grid>
          </div>
          <div style={{ "margin-top": "50px" }}>
            <SalesHeader
              cardData={cardData}
              selectedPlants={selectedPlants}
              graphsData={graphsData}
              selectedCategory={selectedCategory}
            />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Sales;
