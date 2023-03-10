import React, { useMemo, useState } from "react";
import {
  Alert,
  BackButton,
  Button,
  Input,
  Modal,
  Search,
  Table,
  Toaster,
} from "../../components";
import styles from "./Categories.module.css";
import { getCategoriesTableBody, initialCategory } from "./helper";
import {
  useGetAllCategoriesQuery,
  useDeleteCategoriesMutation,
  useCreateCategoriesMutation
} from "../../services/categories.services";
import debounce from "lodash/debounce";
import _, { cloneDeep } from "lodash";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { toast } from "react-toastify";

const tableHeader = [
  [
    {
      id: new Date().toISOString(),
      isSortable: true,
      value: "Category Name",
    },
    {
      value: "Created On",
    },
    {
      value: "",
    },
  ],
];

const Categories = () => {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [deleteCategory, setDeleteCategory] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);
  const [addInputCategory, setAddInputCategory] = useState("");
  const [addInputCategoryKannada, setInputCategoryKannada] = useState("")
  const [category, setCategory] = useState(false);
  const [page, setPage] = useState(1);

  const { data } = useGetAllCategoriesQuery({
    search: search,
    pageNumber: page,
  });
  const getCategoryCount = useGetAllCategoriesQuery({ isCount: true });
  const count = _.get(getCategoryCount, "data[0].count", 0);
  const [deleteCategoryReq,{isLoading, isError, isSuccess}] = useDeleteCategoriesMutation();
  const[error, setError] = useState(false)
  const[createCategory] = useCreateCategoriesMutation()

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

  const onDeleteClick = async (id) => {
    // const deleteCategories = data.filter((ele)=> ele._id !== id)
    setDeleteCategoryId(id);
    setDeleteCategory(true);
  };

  const tableBody = useMemo(() => {
    return getCategoriesTableBody(data, onDeleteClick);
  }, [JSON.stringify(data)]);

  const onCancelHandler = () => {
    setDeleteCategory(false);
  };

  const onHandleConfirm = async () => {
    await deleteCategoryReq({ id: deleteCategoryId });
    setDeleteCategory(false);
  };

  const onAddCategoryClickHandler = () => {
    setCategory(!category);
  };

  const onCategoryInputChangeHandler = (event) => {
    setAddInputCategory(event.target.value);
  };

  const onCategoryKannadaInputChangeHandler = (event)=>{
    setInputCategoryKannada(event.target.value)
  }
  const onIncrementHandler = () => {
    setPage(page + 1);
  };

  const onDecrementHandler = () => {
    setPage(page - 1);
  };

  const onCategeorySubmitHandler = async()=>{
    const obj = {
      "nameInEnglish": addInputCategory,
      "nameInKannada": addInputCategoryKannada
    }
    const res = await createCategory({
      body: obj
    })
    console.log(res)
    if(res.data){
      toast.success("Category added Successfully!")
      setError("")
      setAddInputCategory("")
      setInputCategoryKannada("")
    } 
    if(res.error){
      toast.error("Unable to Add...");
      setError(res?.error?.data.error)
    }
  }

  return (
    <div className={styles.categoriesContainer}>
      <Toaster/>
      <div className={styles.innerCategoriesContainer}>
        <div>
          <BackButton navigateTo={"/authorised/dashboard"} />
        </div>
        <div>
          <div>
            <Search
              value={searchInput}
              title="Search for a Category..."
              onChange={onSearchInputHandler}
            />
          </div>
          <div className={styles.categoriesPaginationContainer}>
            <div className={styles.categoriesPaginationInner}>
              <button
                disabled={page === 1}
                onClick={onDecrementHandler}
                className={styles.catBtnCtrls}
              >
                <FaChevronLeft size={16} />
              </button>
              <span>{`${page === 1 ? "1" : (page - 1) * 10 + 1}-${
                page * 10 > count ? count : page * 10
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
          <div className={styles.addCategoryBtn}>
            <Button
              type="primary"
              title="Add Category"
              onClick={onAddCategoryClickHandler}
            />
          </div>
        </div>
        <div className={styles.categoryTableWrapper}>
          <Table
            data={[...tableHeader, ...tableBody]}
            onSortBy={(sort) => console.log(sort)}
          />
        </div>
        <Modal isOpen={deleteCategory} contentLabel="Delete User">
          <Alert
            handleCancel={onCancelHandler}
            handleConfirm={onHandleConfirm}
          />
        </Modal>
      </div>
      {category && (
        <div className={styles.addCategoryContainer}>
          <div className={styles.borderView}>
          <div className={styles.categoryHeader}>
            <span>Add Category</span>
          </div>
          <div className={styles.categoryInput}>
            <Input
              id="english"
              type="text"
              title="Category Name:"
              value={addInputCategory}
              onChange={(e) => onCategoryInputChangeHandler(e)}
            />
          </div>
          <div className={styles.categoryInput}>
            <Input
              id="kannada"
              type="text"
              title="Category Name in Kannada:"
              value={addInputCategoryKannada}
              onChange={(e) => onCategoryKannadaInputChangeHandler(e)}
            />
            <span className={styles.errorText}>{error}</span>
          </div>
          <div className={styles.categorySubmitBtn}>
            <Button onClick={onCategeorySubmitHandler} title="Submit" type="primary" />
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
