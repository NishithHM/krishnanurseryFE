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
  Spinner,
} from "../../components";
import {
  useGetProcurementsQuery,
  useGetProcurementHistoryMutation,
  useAddProcurementVariantsMutation,
  useAddMinimumQuantityMutation,
  useUploadPhampletMutation,
  useGetAllProcurementsQuery,
  useGetPdfDataMutation,
  //   useGetAllMinimumProcurementsMutation
} from "../../services/procurement.services";
import {
  getProcurementListTableBody,
  getTableBody,
  InputCell,
  rowInitState,
  validateMinMaxPrices,
  variantHeaders,
} from "./helper";
import styles from "./ProcurementList.module.css";
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
import DropZone from "../../components/Dropzone/Dropzone";
import { MIME_TYPES } from "@mantine/dropzone";

const billingHistoryHeader = [
  { value: "Procured On", width: "15%" },
  { value: "Total Quantity", width: "10%" },
  { value: "Vendor Name", width: "15%" },
  { value: "Vendor Contact", width: "15%" },
  { value: "Price Per Plant ₹", width: "15%" },
  { value: "Images", width: "10%" },
  { value: "Invoice", width: "10%" },
];

const ProcurementList = () => {
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
  const [phamplet, setPhamphlet] = useState("");
  const [loaders, setLoaders] = useState(false);
  const [quanityLoaders, setQuantityLoaders] = useState(false);
  const [isMinimumSelected, setMinimumMode] = useState(false);
  const [selectpdf, setSelectpdf] = useState(false);
  const [pdfpath, setPDFpath] = useState(false);
  const [pdfOpen,setPdfOpen] = useState(false);
  const [uploadPdfData] = useUploadPhampletMutation();
  const [GetPdfData] = useGetPdfDataMutation();
const [filename,setFileName] = useState();
  const tableHeader = [
    [
      {
        id: new Date().toISOString(),
        value: " Last Procured On",
        isSortable: isMinimumSelected ? false : true,
        sortBy: "lastProcuredOn",
      },
      {
        value: "Plant Name",
        isSortable: isMinimumSelected ? false : true,
        sortBy: "plantName",
      },
      {
        value: "Under Maintenance",
      },
      {
        value: "Remaining Quantity",
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
  const [imageLoader,setImageLoader] = useState(false)
const [pdfsdata,setPdfsData] = useState([]);
  const [values] = useContext(AuthContext);
  const role = values.role;
  const getProcurements = useGetProcurementsQuery({
    pageNumber: page,
    search: searchInputDeb,
    sortBy: isMinimumSelected ? "minimumQuantity" : sort.sortBy,
    sortType: sort.sortType === "asc" ? 1 : -1,
    isMinimumSelected,
  });

  useEffect(() => {
    if (getProcurements.status === "fulfilled" && firstLoad) {
      const data = getProcurements.data;
      if (data.length > 0) {
        onDetailClick(data[0]._id);
        setFirstLoad(false)
      }
    }
  }, [getProcurements]);

  // setId;
  const [getProcurementHistory] = useGetProcurementHistoryMutation();
  const [addProcurementVariants] = useAddProcurementVariantsMutation();
  const [addMinimumQuantity] = useAddMinimumQuantityMutation();
  const getProcurementCount = useGetProcurementsQuery({
    isCount: true,
    search: searchInput,
  });
  const getLowProcurementCount = useGetProcurementsQuery({
    isCount: true,
    search: searchInput,
    isMinimumSelected: true,
  });

  const setImageurlsHandler = (data) => {
    fetchAndDisplayImages(data.images);
  };

  const count = get(getProcurementCount, "data[0].count", 0);
  const countLow = get(getLowProcurementCount, "data[0].count", 0);
  const finalCount = isMinimumSelected ? countLow : count;
  const searchHandler = debounce(async (query) => {
    if (query.length >= 3) {
      setSearchInputDeb(query);
    } else {
      setSearchInputDeb("");
    }
  }, 500);

  const onDetailClick = (id) => {
    const procurementData = getProcurements.data.find((ele) => ele._id === id);
    const history = procurementData?.procurementHistory;
    const variants = procurementData?.variants;
    setQuantity(procurementData?.minimumQuantity);
    setPhamphlet(procurementData?.phamplet)
    if (variants?.length > 0) {
      const mappedVariants = variants.map((ele) => {
        const row = [];
        row.push({
          value: ele.names.en.name,
          id: "variantNameInEnglish",
          type: "text",
        });
        row.push({
          value: ele.names.ka.name,
          id: "variantNameInKannada",
          type: "text",
        });
        row.push({ value: ele.minPrice, id: "minPrice", type: "number" });
        row.push({ value: ele.maxPrice, id: "maxPrice", type: "number" });
        return row;
      });
      setVariantRows(mappedVariants);
    } else {
      setVariantRows([rowInitState]);
    }
    const body = getTableBody(history, setImageurlsHandler);
    setProcurementListHistory(body);
    setProcurementListHistoryTitle(procurementData.names.en.name);
    setHistoryCount(body.length);
    setId(id);
    setStartDate("");
    setEndDate("");
  };
  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
    searchHandler(event.target.value);
  };
  const tableBody = useMemo(() => {
    return getProcurementListTableBody(getProcurements.data, onDetailClick);
  }, [JSON.stringify(getProcurements.data)]);
  const onIncrementPage = () => {
    setPage(page + 1);
  };

  const onHistoryPageChange = async (isAdd) => {
    const page = isAdd ? pageFilter + 1 : pageFilter - 1;

    setPageFilter(page);
    const data = {
      startDate: dayjs(startDate).format("YYYY-MM-DD"),
      endDate: dayjs(endDate).format("YYYY-MM-DD"),
      id: id,
      pageNumber: page,
    };
    const res = await getProcurementHistory(data);

    if (res) {
      const body = await getTableBody(res.data, setImageurlsHandler);
      setProcurementListHistory(body);
    }
  };
  const onDecrementPage = () => {
    setPage(page - 1);
  };

  const onChangeHandler = (e) => {
    setStartDate(e.start_date);
    setEndDate(e.end_date);
  };

  const onSubmitHandler = async (e) => {
    if(e.start_date !== null && e.end_date !== null) {
    const res = await getProcurementHistory({
      startDate: dayjs(e.start_date).format("YYYY-MM-DD"),
      endDate: dayjs(e.end_date).format("YYYY-MM-DD"),
      id: id,
      pageNumber: 1,
    });
    const resCount = await getProcurementHistory({
      startDate: dayjs(e.start_date).format("YYYY-MM-DD"),
      endDate: dayjs(e.end_date).format("YYYY-MM-DD"),
      id: id,
      isCount: true,
    });
    setHistoryCount(resCount.data[0]?.count);

    if (res.data) {
      const body = await getTableBody(res.data, setImageurlsHandler);
      setProcurementListHistory(body);
      setError("");
    }
    if (res.error) {
      toast.error("Unable to Add...");
      setError(res?.error?.data.error);
    }
   }
    else {
      const procurementData = getProcurements.data.find((ele) => ele._id === id);
      const history = procurementData?.procurementHistory;
      const body = getTableBody(history, setImageurlsHandler);
      setProcurementListHistory(body);
   }
  };

  const onVariantInputChange = ({ val, cIndex, rIndex }) => {
    if (cIndex > 1) {
      val = +val;
    }
    const oldRow = cloneDeep(variantRows);
    const cellData = oldRow[rIndex][cIndex];
    cellData.value = val;
    oldRow[rIndex][cIndex] = cellData;
    setVariantRows(oldRow);
  };


  const onVariantSubmitHandler = async () => {
    setLoaders(true);
    
    const isValid = validateMinMaxPrices(variantRows);
    if(!isValid) {
      setLoaders(false)
      return toast.error("Max Price value must be greater than Min Price value")
    }
    
    const variants = variantRows.map((ele) => {
      return ele.reduce((acc, val) => {
        const obj = { [val.id]: val.value };
        return { ...acc, ...obj };
      }, {});
    });
    
    const res = await addProcurementVariants({
      id: id,
      body: { variants },
    });
    getProcurements.refetch();
    if (res) {
      toast.success("Variants added Successfully!");
    }
    setLoaders(false);
  };

  const onQuantityChangeHandler = (e) => {
    setQuantity(+e.target.value);
  };

  const onQuantitySubmitHandler = async () => {
    setQuantityLoaders(true);
    const obj = { minimumQuantity: quantity };
    const res = await addMinimumQuantity({
      id: id,
      body: obj,
    });
    getProcurements.refetch();
    if (res) {
      toast.success("Quantity added Successfully!");
    }
    setQuantityLoaders(false);
  };

  const disabledVariantsSubmit = useMemo(() => {
    const flattenedArray = variantRows.flatMap((ele) => {
      return ele;
    });
    return flattenedArray.some((ele) => !ele.value);
  }, [JSON.stringify(variantRows)]);

  const onSortClickHandler = (val) => {
    setSort((prev) => {
      return {
        ...prev,
        sortBy: val,
        sortType: prev.sortType === "asc" ? "desc" : "asc",
      };
    });
  };

  const onDeleteHandler = (index) => {
    setVariantRows((prev) => prev.filter((val, i) => i !== index));
  };

  const fetchAndDisplayImages = (urls) => {
    const promises = [];
    const images = [];

    if (urls.length === 0) return toast.error("No Images Found!");
    setImageLoader(true)
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
        .catch((error) => {
           setImageLoader(false)
        });
      promises.push(promise);
    });
    Promise.all(promises).then(() => {
      if(pdfOpen){
        setPdfsData(images)
      }else if(!pdfOpen){
        setPlantImages(images);
      }
    setImageLoader(false);
  });
  };

  const onMinimumClick = () => {
    setMinimumMode(!isMinimumSelected);
  };

  const handlePhamplet=async(files)=>{
    const selectedFile = files[0];
    const formData = new FormData();
    formData.append('images', selectedFile);


  try{
    const data = await uploadPdfData({
      body :formData
      } );
     if(data.message !== null){
      const response = await GetPdfData();
      setFileName(response?.data[0]?.pamphlet)
     }
  }catch(err){
    console.log(err,"====errr");
  }
    //check
    
  }
  const imageOpen = ()=>{
    setSelectpdf(true);
    setPDFpath(true);
    setPdfOpen(true);
  }
  const openPdfsImage = ()=>{
  fetchAndDisplayImages([filename])
}
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
            {countLow > 0 && (
              <div className={styles.immediateButton}>
                <Button
                  onClick={onMinimumClick}
                  title={isMinimumSelected ? "All Items" : "Low Quantity"}
                  type={isMinimumSelected ? "primary" : "alert"}
                />
              </div>
            )}
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
                page * 10 > finalCount ? finalCount : page * 10
                } of ${finalCount}`}</span>
              <button
                disabled={
                  (page * 10 > finalCount ? finalCount : page * 10) >=
                  finalCount
                }
                className={styles.btnControls}
                onClick={onIncrementPage}
              >
                <FaChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className={styles.tablewrapper}>
            {
              (tableBody.length === 0) ? (
                <Spinner />
              ) : (
                <Table
                 data={[...tableHeader, ...tableBody]}
                 onSortBy={onSortClickHandler}
                />
              )
            }
          </div>
        </div>
        {id && (
          <div className={styles.tableProcurementListData}>
            {procurementListHistory?.length !== 0 && (
              <div className={styles.paginationContainerFilter}>
                <div className={styles.paginationInnerFilter}>
                  <button
                    disabled={page === 1}
                    className={styles.btnControls}
                    onClick={() => onHistoryPageChange(false)}
                  >
                    <FaChevronLeft size={16} />
                  </button>
                  <span>{`${
                    pageFilter === 1 ? "1" : (pageFilter - 1) * 10 + 1
                  }-${
                    pageFilter * 10 > historyCount
                      ? historyCount
                      : pageFilter * 10
                    } of ${historyCount}`}</span>
                  <button
                    disabled={
                      (pageFilter * 10 > historyCount
                        ? historyCount
                        : pageFilter * 10) >= historyCount
                    }
                    className={styles.btnControls}
                    onClick={() => onHistoryPageChange(true)}
                  >
                    <FaChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
            <div>
              {id && (
                <>
                  <div>
                    <Filters
                      startDateInput={startDate}
                      endDateInput={endDate}
                      onChange={onChangeHandler}
                      onSubmit={onSubmitHandler}
                    />
                    {/* <Table data={[...tableHeaderHistory, ...procurementListFilter]} /> */}
                  </div>
                  <div className={styles.procurementListHeader}>
                    <span>Procurement History</span>
                    <span>&nbsp;- {procurementListHistoryTitle}</span>
                  </div>
                </>
              )}
              {procurementListHistory?.length !== 0 ? (
                <div>
                  <ScrollTable
                    thead={billingHistoryHeader}
                    tbody={procurementListHistory}
                  />
                </div>
              ) : (
                id && (
                  <div className={styles.noDataDisplayText}>
                    {" "}
                    <span>There's nothing to display!</span>{" "}
                  </div>
                )
              )}

              {role === "admin" && (
                <>
                  <div>
                    <div
                      className={styles.addButton}
                      onClick={() =>
                        setVariantRows([...variantRows, rowInitState])
                      }
                    >
                      <div className={styles.plusIcon}> +</div>
                    </div>
                    <table className={styles.tableVariants}>
                      <thead>
                        {variantHeaders.map((ele) => (
                          <th key={ele}>
                            <span>{ele}</span>
                          </th>
                        ))}
                      </thead>
                      <tbody>
                        {variantRows.map((row, rIndex) => (
                          <tr key={rIndex}>
                            {row.map((cell, cIndex) => (
                              <>
                                <td key={cell.id + cIndex}>
                                  <InputCell
                                    {...cell}
                                    rIndex={rIndex}
                                    cIndex={cIndex}
                                    onInputChange={(val) =>
                                      onVariantInputChange({
                                        val,
                                        cIndex,
                                        rIndex,
                                      })
                                    }
                                  />
                                </td>
                              </>
                            ))}

                            <button
                              className={styles.delIcon}
                              onClick={() => onDeleteHandler(rIndex)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className={styles.submitWrapper}>
                    <div className={styles.submitBtn}>
                      <Button
                        type="primary"
                        title="Submit Variants"
                        onClick={onVariantSubmitHandler}
                        disabled={disabledVariantsSubmit}
                        loading={loaders}
                      />
                    </div>
                  </div>
                  <span className={styles.errorText}>{error}</span>
                  <div className={styles.quantityWrapper}>
                    <div>
                      <Input
                        id="quantity"
                        type="number"
                        title="Minimum Inventory Quantity"
                        onChange={onQuantityChangeHandler}
                        value={quantity}
                      />
                    </div>
                    <div className={styles.submitQuantity}>
                      <Button
                        type="primary"
                        title="Submit Quantity"
                        onClick={onQuantitySubmitHandler}
                        disabled={!quantity}
                        loading={quanityLoaders}
                      />
                    </div>
                  </div>
                  <p>Minimum stock needs to be mainained in inventory</p>
                </>
              )}
              {role === "procurement" && (
                <>
                  <div className={styles.quantityWrapper}>
                    <div>
                      <Input
                        id="quantity"
                        type="number"
                        title="Minimum Inventory Quantity"
                        value={quantity}
                        disabled
                      />
                    </div>
                  </div>
                  <p>Minimum stock needs to be mainained in inventory</p>
                </>
              )}
              {role==='admin' && 
              <div>
                <div style={{display:"flex",justifyContent : "space-between"}}>
                <div>
                    <span style={{fontWeight:'bold'}}>Plant phamplet</span>
                </div>
                {
                  filename && filename !==null ? <div><button onClick={openPdfsImage} className={styles.viewbtn}>View</button></div> : ""
                }
                </div>
                <div>
                  <span>{phamplet}</span>
                </div>
                <div onClick={imageOpen}>
                {
                  selectpdf ?<Spinner/> :<DropZone
                  onDrop={(files) => {
                    handlePhamplet(files);
                    setSelectpdf(false);
                  }}
                  onReject={(files) => {
                    toast.error(files[0].errors[0].code.replaceAll("-", " "));
                  }}
                 
                  maxSize={3 * 1024 ** 2}
                  maxFiles="1"
                  multiple={true}
                  accept={[MIME_TYPES.pdf]}
                  maxFileSize="5"
                
                />
                }
                </div>
                {/* {
                  selectpdf ?<Spinner/> :<DropZone
                  onDrop={(files) => {
                    handlePhamplet(files);
                    setSelectpdf(false);
                  }}
                  onReject={(files) => {
                    toast.error(files[0].errors[0].code.replaceAll("-", " "));
                  }}
                  maxSize={3 * 1024 ** 2}
                  maxFiles="1"
                  multiple={true}
                  accept={[MIME_TYPES.pdf]}
                  maxFileSize="5"
                />
                } */}
                
              </div>
              }
            </div>
          </div>
        )}
      </div>
     {
      imageLoader && pdfsdata.length === 0 ? 
         <div style={{position : "absolute", top : "50%", left : "49%"}}>
            <Spinner />
         </div> : 
          <Modal isOpen={plantImages.length > 0}>
        <div
          style={{
            border: "1px solid #e2e2e2",
            boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
            padding: "1rem",
            minWidth: "50%",
            maxWidth: "80%",
            background: "#ffffff",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p
              style={{ color: "#038819 ", fontSize: "20px", fontWeight: "600" }}
            >
              Plant Images
            </p>
            <GrClose
              size={22}
              onClick={() => {
                setPlantImages([]);
              }}
              style={{ cursor: "pointer" }}
            />
          </div>
          <div
            style={{
              maxHeight: "70vh",
              overflow: "auto",
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
          {
           plantImages.map((img) => {
              return (
                <>
                  {
                    imageLoader ? <Spinner /> :  (
                      <img src={img} alt="img" style={{ maxWidth: "20rem" }} />
                    )
                  }
                </>
              );
            })
          }
          </div>
        </div>
      </Modal>
      
     }
     {/* pdf open images */}
     {
      imageLoader && pdfsdata.length === 0 ?
      <div style={{position : "absolute", top : "50%", left : "49%"}}>
      <Spinner />
   </div> : 
    <Modal isOpen={pdfsdata.length > 0}>
  <div
    style={{
      border: "1px solid #e2e2e2",
      boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
      padding: "1rem",
      minWidth: "50%",
      maxWidth: "80%",
      background: "#ffffff",
      borderRadius: "8px",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <p
        style={{ color: "#038819 ", fontSize: "20px", fontWeight: "600" }}
      >
        PDF DATA
      </p>
      <GrClose
        size={22}
        onClick={() => {
          setPdfsData([]);
        }}
        style={{ cursor: "pointer" }}
      />
    </div>
    <div
      style={{
        maxHeight: "70vh",
        overflow: "auto",
        display: "flex",
        gap: "20px",
        flexWrap: "wrap",
      }}
    >
          {pdfsdata.map((pdf) => (
      <iframe
        key={pdf}
        title="pdf"
        src={pdf}
        style={{ width: "100%", height: "600px" }}
      />
    ))}
    </div>
  </div>
</Modal>
     }
    </>
  );
};

export default ProcurementList;
