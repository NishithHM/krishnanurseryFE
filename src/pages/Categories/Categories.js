import React, { useMemo, useState } from "react";
import {
  Alert,
  BackButton,
  Button,
  Modal,
  Search,
  Table,
} from "../../components";
import styles from "./Categories.module.css";
import { getCategoriesTableBody } from "./helper";
import { useGetAllCategoriesQuery,useDeleteCategoriesMutation  } from "../../services/categories.services";
import debounce from "lodash/debounce";

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
  const[deleteCategory, setDeleteCategory] = useState(false)
  const[deleteCategoryId, setDeleteCategoryId] = useState(null)

  const { data } = useGetAllCategoriesQuery({ search: search });
  const [deleteCategoryReq] = useDeleteCategoriesMutation()
 
  console.log(search);
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
 
  const onDeleteClick = async(id)=>{
    // const deleteCategories = data.filter((ele)=> ele._id !== id)
    setDeleteCategoryId(id)
    setDeleteCategory(true)
  }

  const tableBody = useMemo(() => {
    return getCategoriesTableBody(data, onDeleteClick);
  }, [JSON.stringify(data)]);

  const onCancelHandler = ()=>{
    setDeleteCategory(false)
  }

  const onHandleConfirm =async ()=>{
   
        await deleteCategoryReq({id: deleteCategoryId})
        setDeleteCategory(false)
    
  }

  return (
    <div className={styles.categoriesContainer}>
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
          <div className={styles.addCategoryBtn}>
            <Button type="primary" title="Add Category" />
          </div>
        </div>
        <div className={styles.categoryTableWrapper}>
          <Table
            data={[...tableHeader, ...tableBody]}
            onSortBy={(sort) => console.log(sort)}
          />
        </div>
        <Modal isOpen={deleteCategory} contentLabel="Delete User">
       <Alert handleCancel={onCancelHandler} handleConfirm={onHandleConfirm}/>
       </Modal>
      </div>
    </div>
  );
};

export default Categories;
