import React, { useEffect, useMemo, useState } from "react";
import Styles from "./AgriVariants.module.css";
import {
  Alert,
  BackButton,
  Button,
  Dropdown,
  Modal,
  Search,
  Spinner,
  Table,
} from "../../components";
import { getVariantsBody, initialCategory } from "./helper";
import {
  useDeleteAgriVariantByIdMutation,
  useGetAgriOptionValuesMutation,
  useGetAgriVariantsQuery,
} from "../../services/agrivariants.services";
import _, { debounce } from "lodash";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [typeOptions, setTypeOptions] = useState([]);
  const [selectedTypeOption, setSelectedTypeOption] = useState(null);
  const [deleteVariant, setDeleteVariant] = useState({ opened: false });

  const { data, refetch } = useGetAgriVariantsQuery({
    search: search,
    pageNumber: page,
    type: selectedTypeOption?.value || null,
  });
  const getCategoryCount = useGetAgriVariantsQuery({
    isCount: true,
    search: searchInput,
  });

  const [getOptionValues] = useGetAgriOptionValuesMutation();
  const [deleteAgriVariant] = useDeleteAgriVariantByIdMutation();

  const getValues = async () => {
    const res = await getOptionValues({ type: "type" });
    const options = res.data.map((e) => ({ label: e, value: e }));
    setTypeOptions(options);
    // setSelectedTypeOption(options[0]);
  };
  useEffect(() => {
    getValues();
  }, []);

  useEffect(() => {
    refetch();
  }, [selectedTypeOption]);

  const count = _.get(getCategoryCount, "data[0].count", 0);

  const searchHandler = debounce(async (query) => {
    if (query.length >= 2) {
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

  const editClickHandler = (id) => {
    navigate("../dashboard/agri-add-variants?editId=" + id);
  };
  const deleteClickHandler = (id) => {
    setDeleteVariant({ opened: true, id });
  };
  const tableBody = useMemo(() => {
    return getVariantsBody(data, deleteClickHandler, editClickHandler);
  }, [JSON.stringify(data)]);
  return (
    <>
      <div className={Styles.agriContainer}>
        <div className={Styles.innerAgriContainer}>
          <div>
            <BackButton navigateTo={"/authorised/dashboard"} />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
            }}
          >
            <div className={Styles.wrapper}>
              <Search
                value={searchInput}
                title="Search Variant Name..."
                onChange={onSearchInputHandler}
              />
              <div className={Styles.dropdownContainer}>
                <Dropdown
                  placeholder="Select Variant Type"
                  data={typeOptions}
                  value={selectedTypeOption}
                  onChange={(e) => setSelectedTypeOption(e)}
                />
              </div>
            </div>
            <div className={Styles.agriPaginationContainer}>
              <Button
                title="Add New Variant"
                onClick={() => {
                  navigate("../dashboard/agri-add-variants");
                }}
              />
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
            {
              tableBody.length === 0 ? <Spinner /> : (
                <Table data={[...tableHeader, ...tableBody]} />
              )
            }
          </div>
        </div>
      </div>
      <Modal isOpen={deleteVariant.opened} contentLabel="Delete User">
        <Alert
          message={`Are you sure to delete this variant?`}
          subMessage={"This action cannot be undone."}
          confirmBtnType="alert"
          confirmBtnLabel="Delete"
          cancelBtnLabel="cancel"
          handleCancel={() => {
            setDeleteVariant({ opened: false });
          }}
          handleConfirm={async () => {
            await deleteAgriVariant({ id: deleteVariant.id });
            setDeleteVariant({ opened: false });
            refetch();
          }}
        />
      </Modal>
    </>
  );
};

export default AgriVariants;
