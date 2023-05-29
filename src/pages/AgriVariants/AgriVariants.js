import React, { useMemo, useState } from "react";
import Styles from "./AgriVariants.module.css";
import { BackButton, Dropdown, Search, Table } from "../../components";
import { getVariantsBody, initialCategory } from "./helper";
import { useGetAgriVariantsQuery } from "../../services/agrivariants.services";
import _, { debounce } from "lodash";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const tableHeader = [
  [
    {
      id: new Date().toISOString(),
      isSortable: false,
      value: "Variant Type",
    },
    {
      value: "Variant Name",
    },
    {
      value: "",
    },
  ],
];

const AgriVariants = () => {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const { data } = useGetAgriVariantsQuery({
    search: search,
    pageNumber: page,
  });
  const getCategoryCount = useGetAgriVariantsQuery({
    isCount: true,
    search: searchInput,
  });
  const count = _.get(getCategoryCount, "data[0].count", 0);
  console.log(data);
  const searchHandler = debounce(async (query) => {
    if (query.length >= 3) {
      setSearch(query);
    } else {
      setSearch("");
    }
  }, 500);

  const onSearchInputHandler = (event) => {
    setSearchInput(event.target.value);
    searchHandler(event.target.value);
  };
  const onIncrementHandler = () => {
    setPage(page + 1);
  };

  const onDecrementHandler = () => {
    setPage(page - 1);
  };
  const tableBody = useMemo(() => {
    return getVariantsBody(data);
  }, [JSON.stringify(data)]);

  return (
    <div className={Styles.agriContainer}>
      <div className={Styles.innerAgriContainer}>
        <div>
          <BackButton navigateTo={"/authorised/dashboard"} />
        </div>
        <div>
          <div className={Styles.wrapper}>
            <Search
              value={searchInput}
              title="Search for Agri Variants..."
              onChange={onSearchInputHandler}
            />
            <div className={Styles.dropdownContainer}>
              <Dropdown />
            </div>
          </div>
          <div className={Styles.agriPaginationContainer}>
            <div className={Styles.agriPaginationInner}>
              <button
                disabled={page === 1}
                onClick={onDecrementHandler}
                className={Styles.catBtnCtrls}
              >
                <FaChevronLeft size={16} />
              </button>
              <span>{`${page === 1 ? "1" : (page - 1) * 10 + 1}-${
                page * 10 > count ? count : page * 10
              } of ${count}`}</span>
              <button
                disabled={(page * 10 > count ? count : page * 10) >= count}
                onClick={onIncrementHandler}
                className={Styles.catBtnCtrls}
              >
                <FaChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className={Styles.variantsTableWrapper}>
          <Table data={[...tableHeader, ...tableBody]} />
        </div>
      </div>
    </div>
  );
};

export default AgriVariants;
