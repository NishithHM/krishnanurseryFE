import React, { useEffect, useState , useCallback } from "react";
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

const Sales = () => {
  const [metaData, { data }] = useMetaDataMutation();
  const [graphData] = useGraphDataMutation();
  const [cardData, setCardData] = useState(null);
  const [graphsData, setGraphsData] = useState(null);
  const [dateRange, setDateRange] = useState({});
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
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
      const formattedStartDate = dayjs(selectedDate.startDate).format("YYYY-MM");
      const formattedEndDate = dayjs(selectedDate.endDate).format("YYYY-MM");

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
      <Container maxWidth="xl" className=" containermax ">
        <Container>
          <div >
            <h1>Dash Board</h1>
          </div>
          <div>
            <div>
              <Grid
                container
                spacing={2}
                item
                xs={12}
                columnSpacing={{ xs: 3, sm: 6, md: 9 }}
              >
                <Grid item xs={3}>
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
                <Grid item xs={3}>
                  <Datefilter
                    onChange={handleDateChange}
                    startDateInput={dateRange.startDate}
                    endDateInput={dateRange.endDate}
                  />
                </Grid>
                <Grid item xs={3}>
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
            <div style={{"margin-top":"50px"}}>
              <SalesHeader cardData={cardData} selectedPlants={selectedPlants} graphsData={graphsData} selectedCategory={selectedCategory} />
            </div>
          </div>
        </Container>
      </Container>
    </div>
  );
};

export default Sales;