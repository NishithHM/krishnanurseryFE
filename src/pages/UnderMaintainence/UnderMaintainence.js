import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Filters,
  Search,
  Table,
  BackButton,
  Button,
  Input,
  Toaster,
  Modal,
} from "../../components";
import {
  useGetProcurementsQuery,
  useGetProcurementHistoryMutation,
  useAddProcurementVariantsMutation,
  useAddMinimumQuantityMutation,
  //   useGetAllMinimumProcurementsMutation
} from "../../services/procurement.services";
import {
  getProcurementListTableBody,
  getTableBody,
  InputCell,
  rowInitState,
  variantHeaders,
} from "./helper";
import styles from "./UnderMaintenance.module.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { cloneDeep, get } from "lodash";
import debounce from "lodash/debounce";
import dayjs from "dayjs";
import { AuthContext } from "../../context";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import ScrollTable from "../../components/Table/ScrollTable";
import { GrClose } from "react-icons/gr";

const billingHistoryHeader = [
  { value: "Procured On", width: "15%" },
  { value: "Total Quantity", width: "10%" },
  { value: "Vendor Name", width: "15%" },
  { value: "Vendor Contact", width: "15%" },
  { value: "Price Per Plant ₹", width: "15%" },
  { value: "Images", width: "10%" },
  { value: "Invoice", width: "10%" },
];

const UnderMaintainence = () => {
  const [page, setPage] = useState(1);
  const [pageFilter, setPageFilter] = useState(1);
  const [procurementListHistory, setProcurementListHistory] = useState([]);
  const [procurementListHistoryTitle, setProcurementListHistoryTitle] =
    useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchInputDeb, setSearchInputDeb] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [id, setId] = useState(null);
  const [historyCount, setHistoryCount] = useState(0);
  const [variantRows, setVariantRows] = useState([rowInitState]);
  const [quantity, setQuantity] = useState("");
  const [loaders, setLoaders] = useState(false);
  const [quanityLoaders, setQuantityLoaders] = useState(false);
  const [isMinimumSelected, setMinimumMode] = useState(false);

  const tableHeader = [
    [
      {
        id: new Date().toISOString(),
        value: "Plant Name",
      },
      {
        value: "Remaining Quantity",
      },
      {
        value: "Under Maintenance",
      },

      {
        value: "",
      },
    ],
  ];

  const [sort, setSort] = useState({
    sortBy: "lastProcuredOn",
    sortType: "desc",
  });
  const [error, setError] = useState(false);

  const [firstLoad, setFirstLoad] = useState(true);

  const [plantImages, setPlantImages] = useState([]);

  const [values] = useContext(AuthContext);
  console.log(values);
  const role = values.role;
  const getProcurements = useGetProcurementsQuery({
    pageNumber: page,
    search: searchInputDeb,
    sortBy: isMinimumSelected ? "minimumQuantity" : sort.sortBy,
    sortType: sort.sortType === "asc" ? 1 : -1,
    isMinimumSelected,
    isAll: true,
  });

  useEffect(() => {
    if (getProcurements.status === "fulfilled" && firstLoad) {
      const data = getProcurements.data;
      if (data.length > 0) {
        console.log(data[0]);
      }
    }
  }, [getProcurements]);

  const getProcurementCount = useGetProcurementsQuery({
    isCount: true,
    search: searchInput,
  });

  const setImageurlsHandler = (data) => {
    fetchAndDisplayImages(data.images);
  };

  const count = get(getProcurementCount, "data[0].count", 0);

  const searchHandler = debounce(async (query) => {
    if (query.length >= 3) {
      setSearchInputDeb(query);
    } else {
      setSearchInputDeb("");
    }
  }, 500);

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
    searchHandler(event.target.value);
  };

  const tableBody = useMemo(() => {
    return getProcurementListTableBody(getProcurements.data);
  }, [JSON.stringify(getProcurements.data)]);

  const onIncrementPage = () => {
    setPage(page + 1);
  };
  const onDecrementPage = () => {
    setPage(page - 1);
  };

  const fetchAndDisplayImages = (urls) => {
    const promises = [];
    const images = [];
    console.log(urls);
    if (urls.length === 0) return toast.error("No Images Found!");
    urls.forEach((url) => {
      const promise = fetch(
        `${process.env.REACT_APP_BASE_URL}/api/download?path=${url}`,
        {
          headers: {
            Authorization: sessionStorage.getItem("authToken"),
          },
        }
      )
        .then((response) => response.blob())
        .then((data) => {
          const imageUrl = URL.createObjectURL(data);
          const img = new Image();
          img.src = imageUrl;
          images.push(imageUrl);
        })
        .catch((error) => console.error(error));
      promises.push(promise);
    });
    Promise.all(promises).then(() => {
      console.log(images);
      setPlantImages(images);
    });
  };

  const onMinimumClick = () => {
    setMinimumMode(!isMinimumSelected);
  };

  return (
    <>
      <Toaster />

      <div className={styles.container}>
        <div className={styles.innerContainer}>
          <div>
            <BackButton navigateTo={"/authorised/dashboard"} />
          </div>
          <div className={styles.searchContainer}>
            <Search
              value={searchInput}
              title="Search for a Plant..."
              onChange={handleSearchInputChange}
            />
          </div>
          <div className={styles.paginationContainer}>
            <div className={styles.paginationInner}>
              <button
                disabled={page === 1}
                className={styles.btnControls}
                onClick={onDecrementPage}
              >
                <FaChevronLeft size={16} />
              </button>
              <span>{`${page === 1 ? "1" : (page - 1) * 10 + 1}-${
                page * 10 > count ? count : page * 10
              } of ${count}`}</span>
              <button
                disabled={(page * 10 > count ? count : page * 10) >= count}
                className={styles.btnControls}
                onClick={onIncrementPage}
              >
                <FaChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className={styles.tablewrapper}>
            <Table data={[...tableHeader, ...tableBody]} />
          </div>
        </div>
      </div>
    </>
  );
};

export default UnderMaintainence;
