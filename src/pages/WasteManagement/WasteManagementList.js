import dayjs from "dayjs";
import debounce from "lodash/debounce";
import styles from "./WasteManagement.module.css";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
    Button,
    Table,
    Spinner,
    BackButton,
    Modal,
    Toaster,
} from "../../components";

import { ImSearch } from "react-icons/im";
import get from "lodash/get";
import { useGetDamagesListMutation } from "../../services/procurement.services";
import { GrClose } from "react-icons/gr";
import { toast } from "react-toastify";
import { AuthContext } from "../../context";

const WasteList = () => {
    const [page, setPage] = useState(1);
    const [data, setData] = useState([]);
    const [user] = useContext(AuthContext);
    const [getDamages, { isLoading, isError, isSuccess }] = useGetDamagesListMutation()
    const [plantImages, setPlantImages] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [damageCount, setDamageCount] = useState(0);

    const loadInitialOrders = async (page) => {
        if (page === 1) {
            const counts = await getDamages({ isCount: true });
            setDamageCount(get(counts, "data[0].count", 0));
        }
        const list = await getDamages({ pageNumber: page });
        const formattedData = formatDamageData({
            data: list.data,
        });
        setData(formattedData);
    };

    useEffect(() => {
        loadInitialOrders(page);
    }, [page]);

    const fetchAndDisplayImages = (urls) => {
        const promises = [];
        const images = [];
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
          setPlantImages(images);
        });
      };

    // requests


    const formatDamageData = ({ data, }) => {
        const formatted = data.map((ele) => {
            const name = { value: ele.names?.en?.name };
            const createdAt = { value: dayjs(ele.createdAt).format("DD-MM-YYYY") };
            const reportedBy = {
                value: ele.reportedBy?.name,
            };
            const count = { value: ele.damagedQuantity };

            const view = {value:(
                <p
                  onClick={async () => {
                    setImageurlsHandler(ele);
                  }}
                  style={{
                    cursor: "pointer",
                    fontWeight: "bold",
                    color: "#302c2c",
                  }}
                >
                  View
                </p>
              )}


            const data = [name, createdAt, reportedBy, count, view];
            return data;
        });

        return formatted;
    };



    const searchHandler = debounce(async (query) => {
        if (query.length >= 3) {
            const res = await getDamages({ search: query });
            const counts = await getDamages(
                {
                    search: query, isCount: true,
                });
            setDamageCount(get(counts, "data[0].count", 0));
            const list = formatDamageData({
                data: res.data
            });
            setData(list);
        } else if (!isLoading) {
            loadInitialOrders(1)
        }
    }, 500);

    const handleSearchInputChange = (event) => {
        setSearchInput(event.target.value);
        searchHandler(event.target.value);
    };



    const TABLE_HEADER = [
        {
            value: "Plant Name",
            isSortable: false,
        },

        {
            value: "Created Date",
            isSortable: false,
        },
        {
            value: "Reported By",
            isSortable: false,
        },
        {
            value: "Damage Count",
            isSortable: false,
        },
        {
            value: "",
            isSortable: false,
        },
    ];

    const setImageurlsHandler = (data) => {
        fetchAndDisplayImages(data.images);
      };

    return (
        <div>
            <Toaster />
            <div>
                <BackButton navigateTo={"/authorised/dashboard"} />
            </div>
            <div className={styles.listWrapper}>
                {/* search */}
                <div className={styles.searchContainer}>
                    <input
                        value={searchInput}
                        onChange={handleSearchInputChange}
                        placeholder="Search Record ..."
                        className={styles.searchInput}
                    />
                    <ImSearch size={22} color="#4f4e4e" className={styles.searchIcon} />
                </div>
                {/* pagination */}
                <div className={styles.paginationContainer}>
                    { user.role ==='sales' &&<Link to="../dashboard/waste-management/add">
                        <div>
                            <Button title="Add Damages" />
                        </div>
                    </Link>
                    }
                    <div className={styles.paginationInner}>
                        {/* count */}
                        <span>{`${page === 1 ? "1" : (page - 1) * 10}-${page * 10 > damageCount ? damageCount : page * 10
                            } of ${damageCount}`}</span>
                        {/* controls */}
                        <button
                            onClick={() => setPage((e) => e - 1)}
                            disabled={page === 1}
                            className={styles.paginationControls}
                        >
                            <FaChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => setPage((e) => e + 1)}
                            disabled={
                                (page * 10 > damageCount ? damageCount : page * 10) >= damageCount
                            }
                            className={styles.paginationControls}
                        >
                            <FaChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <Spinner />
            ) : (
                <Table data={[TABLE_HEADER, ...data]} />
            )
            }

            {isError && (
                <p className={styles.errorMessage}>Unable to load Users Data</p>
            )}

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
                            style={{ color: "#539C64", fontSize: "20px", fontWeight: "600" }}
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
                        {plantImages.map((img) => {
                            return (
                                <>
                                    <img src={img} alt="img" style={{ maxWidth: "20rem" }} />
                                </>
                            );
                        })}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default WasteList;
