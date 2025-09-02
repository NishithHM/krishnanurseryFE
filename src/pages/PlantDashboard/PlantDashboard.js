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
import InvestmentIcon from "../../icons/InvestmentIcon";
import SalesIcon from "../../icons/SalesIcon";
import WastageIcon from "../../icons/WastageIcon";
import PaymentsIcon from "../../icons/PaymentsIcon";
import InventoryIcon from "../../icons/InventoryIcon";
import ProfitIons from "../../icons/ProfitIons";

const PlantDashboard = ({ type = "plants" }) => {
  const [metaData, { data }] = useMetaDataMutation();
  const [graphData] = useGraphDataMutation();
  const [cardData, setCardData] = useState(null);
  const [graphsData, setGraphsData] = useState(null);
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  // const [selectdate ,setSelectDate] =useState(false)
  const defaultStartDate = dayjs().subtract(1, "year").format("YYYY-MM-DD");
  const defaultEndDate = dayjs().format("YYYY-MM-DD");

  const [dateRange, setDateRange] = useState({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  });

  const handlePlantChange = useCallback(
    (selectedPlants) => {
      setSelectedPlants(selectedPlants);
      setSelectedCategory([]);
    },
    [selectedPlants]
  );

  const handleCategoryChange = useCallback(
    (selectedCategories) => {
      setSelectedCategory(selectedCategories);
      setSelectedPlants([]);
    },
    [selectedCategory]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await metaData({
          body: {
            ...dateRange,
            plants: selectedPlants.map((plant) => plant.value),
            categories: selectedCategory.map((category) => category.value),
            mode: type
          },
        });
        const res1 = await graphData({
          body: {
            ...dateRange,
            plants: selectedPlants.map((plant) => plant.value),
            categories: selectedCategory.map((category) => category.value),
            mode: type
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
      const formattedStartDate = dayjs(selectedDate.startDate).format(
        "YYYY-MM-DD"
      );
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
 
  const getHeaderData = () => {
    let headerData = [];
    if (type === "plants") {
      headerData = [
        {
          title: "Investment",
          graphKey: "investment",
          subtext: "Plants",
          price: cardData?.investment,
          percentage: cardData?.investment_perecntage,
          icon: (status) => <InvestmentIcon status={status} />,
        },
        {
          title: "Sales",
          graphKey: "sales",
          price: cardData?.sales,
          cashAmount: cardData?.cashAmount,
          onlineAmount: cardData?.onlineAmount,
          percentage: cardData?.sales_perecntage,
          icon: (status) => <SalesIcon status={status} />,
        },
        {
          title: "Wastages",
          graphKey: "wastages",
          price: cardData?.damages,
          percentage: cardData?.wastages_perecntage,
          icon: (status) => <WastageIcon status={status} />,
        },
        {
          title: "Profit",
          graphKey: "profit",
          subtext: "plant investment vs sales",
          price: cardData?.profit,
          percentage: cardData?.profit_perecntage,
          icon: (status) => <ProfitIons status={status} />,
        },
        {
          title: "Inventory",
          graphKey: "inventory",
          price: cardData?.inventory,
          // percentage: 10,
          icon: (status) => <InventoryIcon status={status} />,
        },
      ];
    }else if (type === "payments") {
      headerData = [
        {
          title: "Vendor Payments",
          graphKey: "vendorAmount",
          price: cardData?.VENDOR?.payments,
          cashAmount: cardData?.VENDOR?.cashAmount,
          onlineAmount: cardData?.VENDOR?.onlineAmount,
          percentage: cardData?.vendorAmount_perecntage,
          icon: (status) => <PaymentsIcon status={status} />,
        },
        {
          title: "Salary Payments",
          graphKey: "salaryAmount",
          price: cardData?.SALARY?.payments,
          cashAmount: cardData?.SALARY?.cashAmount,
          onlineAmount: cardData?.SALARY?.onlineAmount,
          percentage: cardData?.salaryAmount_perecntage,
          icon: (status) => <PaymentsIcon status={status} />,
        },
        {
          title: "Other Payments",
          graphKey: "othersAmount",
          price: cardData?.OTHERS?.payments,
          cashAmount: cardData?.OTHERS?.cashAmount,
          onlineAmount: cardData?.OTHERS?.onlineAmount,
          percentage: cardData?.othersAmount_perecntage,
          icon: (status) => <PaymentsIcon status={status} />,
        },
        {
          title: "Payments Total",
          graphKey: "payments",
          price: cardData?.TOTAL?.payments,
          cashAmount: cardData?.TOTAL?.cashAmount,
          onlineAmount: cardData?.TOTAL?.onlineAmount,
          percentage: cardData?.payments_perecntage,
          icon: (status) => <PaymentsIcon status={status} />,
        },
        {
          title: "Sales",
          graphKey: "sales",
          price: cardData?.sales,
          cashAmount: cardData?.cashAmount,
          onlineAmount: cardData?.onlineAmount,
          percentage: cardData?.sales_perecntage,
          icon: (status) => <SalesIcon status={status} />,
        },
        {
          title: "Profit",
          graphKey: "profit",
          price: cardData?.profit,
          percentage: cardData?.profit_perecntage,
          icon: (status) => <SalesIcon status={status} />,
        },
        {
          title: "Vendor Deviations",
          price: cardData?.vendorDeviation,
          icon: (status) => <PaymentsIcon status={status} />,
        },
        
      ];
    }
    return headerData;
  };

  return (
    <div>
      <div className={styles.admindash}>
        <div>
          <BackButton navigateTo={"/authorised/dashboard"} className=" backbtn " />
        </div>
        <div className={styles.backnavgia}>
          <h1 style={{ textTransform: "capitalize" }} className={styles.dash + " poppins "}>{type} Dashboard</h1>
        </div>
      </div>
      <Container maxWidth="xl" className=" containermax " style={{ maxWidth: 'unset' }}>
        <div>
          <div>
            <Grid
              classes={{ container: styles.filterContainer }}
              container
              spacing={2}
              item
              xs={12}
            >
              {type === "plants" && <Grid classes={{ item: styles.plants }} item xs={4} className="plants">
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
              </Grid>}
              <Grid
                classes={{ item: styles.dateFilters }}
                item xs={4} className="datefilters">
                <Datefilter
                  onChange={handleDateChange}
                  startDateInput={dateRange.startDate}
                  endDateInput={dateRange.endDate}
                  defaultStartDate={defaultStartDate}
                  defaultEndDate={defaultEndDate}
                />
              </Grid>
              {type === "plants" && <Grid
                classes={{ item: styles.plants }}
                item xs={4} className="plants">
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
              </Grid>}
            </Grid>
          </div>
          <div style={{ "margin-top": "50px" }}>
            <SalesHeader
              cardData={cardData}
              selectedPlants={selectedPlants}
              graphsData={graphsData}
              selectedCategory={selectedCategory}
              headerData={getHeaderData()}
              type={type}
            />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PlantDashboard;
