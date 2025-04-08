import React, { useMemo, useState } from "react";
import styles from './customerList.module.css'
import { BackButton, Dropdown, Search, Spinner, Table } from '../../components'
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useGetCustomersListQuery } from "../../services/customer.service";
import { debounce, get, isEmpty } from "lodash";


const tableHeader = [
    [
        {
            id: new Date().toISOString(),
            isSortable: true,
            value: "Customer Name",
            sortBy: "name",
        },
        {
            value: "Business Name",
        },
        {
            value: "GST Number",
        },
        {
            value: "Type",
        },
        {
            value: "Address"
        },
        {
            value: "Categories"
        }
    ],
];

const getCustomerListBody = (data) => {
    if (isEmpty(data)) {
        return []
    } else {
        return data?.map(val => {
            return tableHeader[0].map(header => {
                let value;
                if (header.value === "Customer Name") {
                    value = val?.name
                }

                if (header.value === "Business Name") {
                    value = val?.businessName || 'NA'
                }

                if (header.value === "GST Number") {
                    value = val?.gst || 'NA'
                }

                if (header.value === "Type") {
                    value = val?.type?.toLowerCase() || 'regular'
                }

                if (header.value === "Address") {
                    value = <span dangerouslySetInnerHTML={{ __html: val.address?.replaceAll(',', '<br/>') }}></span>
                }

                if (header.value === "Categories") {
                    value = val?.interestedCategories?.map(ele => ele?.names?.en?.name)?.join(',') || 'NA'
                }


                return { value }
            })
        })
    }
}

const CustomerList = () => {
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [type, setType] = useState({})
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState({ sortBy: "", sortType: -1, type });
    const { data } = useGetCustomersListQuery({ pageNumber: 1, search: searchInput, type: type.value })
    const getCategoryCount = useGetCustomersListQuery({
        isCount: true,
        search: searchInput,
    });
    const count = get(getCategoryCount, "data[0].count", 0);

    const onSortClick = (sortVal) => {
        setSort((prev) => {
            return {
                ...prev,
                sortBy: sortVal,
                sortType: prev.sortType === 1 ? -1 : 1,
            };
        });
    };
    const onSearchInputHandler = (event) => {
        setSearchInput(event.target.value);
        searchHandler(event.target.value);
    };

    const searchHandler = debounce(async (query) => {
        if (query.length >= 3) {
            setSearch(query);
        } else {
            setSearch("");
        }
    }, 500);

    const onIncrementHandler = () => {
        setPage(page + 1);
    };

    const onDecrementHandler = () => {
        setPage(page - 1);
    };

    const tableBody = useMemo(() => {
        return getCustomerListBody(data);
    }, [JSON.stringify(data)]);


    const dropDownChangeHandler = (e)=>{
        console.log(e)
        setType(e)
    }

    return (
        <div className={styles.customerListContainer}>
            <div className={styles.innerCustomerContainer}>
                <div>
                    <BackButton navigateTo={"/authorised/dashboard"} />
                </div>
                <div>
                    <div style={{display:'flex'}}>
                        <Search
                            value={searchInput}
                            title="Search Customer..."
                            onChange={onSearchInputHandler}
                        />
                        <div style={{width:'200px'}}>
                        <Dropdown
                                id="type"
                                title="Type"
                                onChange={dropDownChangeHandler}
                                value={type}
                                data={[{ label: 'Business', value: 'BUSINESS' }, { label: 'Regular', value: 'REGULAR' }, {label:'Both', value:''}]}
                            />
                        </div>    
                    </div>
                    <div className={styles.customerPaginationContainer}>
                        <div className={styles.customerPaginationInner}>
                            <button
                                disabled={page === 1}
                                onClick={onDecrementHandler}
                                className={styles.catBtnCtrls}
                            >
                                <FaChevronLeft size={16} />
                            </button>
                            <span>{`${page === 1 ? "1" : (page - 1) * 10 + 1}-${page * 10 > count ? count : page * 10
                                } of ${count}`}</span>
                            <button
                                disabled={(page * 10 > count ? count : page * 10) >= count}
                                onClick={onIncrementHandler}
                                className={styles.catBtnCtrls}
                            >
                                <FaChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className={styles.customerTableWrapper}>
                    {
                        (tableBody?.length === 0) ? (
                            <Spinner />
                        ) : (
                            <Table data={[...tableHeader, ...tableBody]} onSortBy={onSortClick} />
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default CustomerList;