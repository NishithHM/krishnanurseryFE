import dayjs from "dayjs";
import debounce from "lodash/debounce";
import styles from "./AccessManagement.module.css";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  Button,
  Modal,
  Table,
  Alert,
  Spinner,
  BackButton,
} from "../../components";

import {
  useDeleteUserMutation,
  useGetAllUsersCountQuery,
  useGetAllUsersQuery,
  useSearchUserMutation,
} from "../../services/user.services";

import { ImSearch } from "react-icons/im";

const AccessManagement = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);

  const [deleteUser, setDeleteUser] = useState(false);
  const [deleteUserUid, setDeleteUserUid] = useState(null);

  const [searchInput, setSearchInput] = useState(null);
  const [usersCount, setUsersCount] = useState(0);

  // requests
  const usersData = useGetAllUsersQuery(page);
  const usersCountReq = useGetAllUsersCountQuery({ search: searchInput });
  const [searchUser] = useSearchUserMutation();
  const [deleteUserReq] = useDeleteUserMutation();

  const openDeleteModalHandler = (uid) => {
    setDeleteUserUid(uid);
    setDeleteUser(true);
  };
  const closeDeleteModalHandler = () => {
    setDeleteUser(false);
    setDeleteUserUid(null);
  };

  const formatUsersData = (data) => {
    console.log(data);
    const formatted = data.map((user) => {
      const name = { value: user.name };
      const createdAt = { value: dayjs(user.createdAt).format("DD-MM-YYYY") };
      const phoneNumber = {
        value: user.phoneNumber,
      };
      const userRole = { value: user.role };
      const deleteUser = {
        value: (
          <span
            style={{ color: "red", fontWeight: "600", cursor: "pointer" }}
            onClick={() => {
              openDeleteModalHandler(user._id);
            }}
          >
            Delete
          </span>
        ),
      };

      const data = [name, createdAt, phoneNumber, userRole, deleteUser];
      return data;
    });

    return formatted;
  };

  const deleteUserHandler = async (uid) => {
    await deleteUserReq(uid);
    closeDeleteModalHandler();
  };

  const searchHandler = debounce(async (query) => {
    console.log("search triggered", query);
    if (query.length >= 3) {
      const res = await searchUser(query);
      console.log(res);
      const users = formatUsersData(res.data.users);
      setData(users);
    }
  }, 500);

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
    searchHandler(event.target.value);
  };

  useEffect(() => {
    if (usersCountReq.status !== "fulfilled") return;
    setUsersCount(usersCountReq.data.users[0]?.count);
  }, [usersCountReq]);

  useEffect(() => {
    if (usersData.status !== "fulfilled") return;
    const users = formatUsersData(usersData.data.users);
    setData(users);
  }, [usersData, searchInput]);

  console.log(usersData);
  const TABLE_HEADER = [
    {
      // id: new Date().toISOString(),
      value: "Name",
      isSortable: false,
    },

    {
      value: "Created Date",
      isSortable: false,
    },
    {
      value: "Phone Number",
      isSortable: false,
    },
    {
      value: "User Role",
      isSortable: false,
    },
    {
      value: "",
      isSortable: false,
    },
  ];

  return (
    <div>
      <div>
        <BackButton navigateTo={"/authorised/dashboard"} />
      </div>
      <div className={styles.wrapper}>
        {/* search */}
        <div className={styles.searchContainer}>
          <input
            value={searchInput}
            onChange={handleSearchInputChange}
            placeholder="Search for an Employee..."
            className={styles.searchInput}
          />
          <ImSearch size={22} color="#4f4e4e" className={styles.searchIcon} />
        </div>
        {/* pagination */}
        <div className={styles.paginationContainer}>
          <Link to="../add-employee">
            <div>
              <Button title="Add Employee" />
            </div>
          </Link>
          <div className={styles.paginationInner}>
            {/* count */}
            <span>{`${page === 1 ? "1" : (page - 1) * 10}-${
              page * 10 > usersCount ? usersCount : page * 10
            } of ${usersCount}`}</span>
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
                (page * 10 > usersCount ? usersCount : page * 10) >= usersCount
              }
              className={styles.paginationControls}
            >
              <FaChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {usersData.isLoading ? (
        <Spinner />
      ) : (
        usersData.status === "fulfilled" && (
          <Table data={[TABLE_HEADER, ...data]} />
        )
      )}

      {usersData.isError && (
        <p className={styles.errorMessage}>Unable to load Users Data</p>
      )}

      <Modal isOpen={deleteUser} contentLabel="Delete User">
        <Alert
          handleCancel={closeDeleteModalHandler}
          handleConfirm={() => deleteUserHandler(deleteUserUid)}
        />
      </Modal>
    </div>
  );
};

export default AccessManagement;
