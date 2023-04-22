import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dropdown,
  Input,
  Table,
  Toaster,
  BackButton,
  Dropzone,
} from "../../components";
import TextArea from "../../components/TextArea";
import styles from "./AddProcurement.module.css";
import {
  useRequestOrderMutation,
  useUpdateProcurementsMutation,
} from "../../services/procurement.services";
import { useCreateProcurementsMutation } from "../../services/procurement.services";
import _ from "lodash";
import { isEmpty } from "lodash";
import { useNavigate } from "react-router-dom";
import { getTableBody } from "./helper";
import { toast } from "react-toastify";
import { useGetAllCategoriesQuery } from "../../services/categories.services";
import { MIME_TYPES } from "@mantine/dropzone";
import { AiOutlineClose } from "react-icons/ai";

const tableHeader = [
  [
    {
      id: new Date().toISOString(),
      value: "Procured On",
    },
    {
      value: "Quantity",
    },
    {
      value: "Vendor Name",
    },
    {
      value: "Vendor Contact",
    },
    {
      value: "Price Per Plant ₹",
    },
  ],
];

const RequestOrder = () => {
  const initialState = {
    totalQuantity: 0,
    description: "",
    addPlantName: {},
    submitDisabled: false,
  };

  const navigate = useNavigate();
  const [state, setState] = useState(initialState);

  const [RequestOrder, { isLoading: isOrderLoading }] =
    useRequestOrderMutation();
  const inputChangeHandler = (event, id) => {
    setState((prev) => {
      return {
        ...prev,
        [id]: event.target.value,
      };
    });
  };

  const dropDownChangeHandler = (event, id) => {
    setState((prev) => {
      return {
        ...prev,
        [id]: event,
      };
    });
  };

  const onSubmitHandler = async () => {
    const body = {
      nameInEnglish: state.addPlantName.label,
      descriptionSales: state.description,
      totalQuantity: parseInt(state.totalQuantity),
      id: state.addPlantName.value,
    };
    return console.log(state);
    console.log(body);
    const response = await RequestOrder({ body });
    toast.success(response.data.message);
    setTimeout(() => {
      navigate("../dashboard/orders");
    }, 1000);
  };

  return (
    <div className={styles.addProcurementPage}>
      <Toaster />
      <div>
        <BackButton navigateTo={"/authorised/dashboard"} />
      </div>

      <div className={styles.outerWrapper}>
        <h1 className={styles.header}>Request Order</h1>
        <div className={styles.innerWrapper}>
          <Dropdown
            url="/api/procurements/getAll?isAll=true"
            id="addPlantName"
            apiDataPath={{ label: "names.en.name", value: "_id" }}
            title="Plant Name"
            onChange={dropDownChangeHandler}
            value={state.addPlantName}
            canCreate={false}
            required
          />
          <Input
            value={state?.addPlantName?.meta?.names?.ka?.name || ""}
            id="addPlantKannada"
            type="text"
            onChange={inputChangeHandler}
            title="Plant Name in Kannada"
            required
            validation={(text) => text.length > 0}
            errorMessage="Please Enter new Plant in Kannada"
            disabled={true}
          />

          <TextArea
            value={state.description}
            id="description"
            onChange={inputChangeHandler}
            title="Description"
            rows={4}
            name="description"
          />
          <Input
            value={state.totalQuantity}
            id="totalQuantity"
            type="number"
            onChange={inputChangeHandler}
            title="Total Quantity"
            required
          />

          <div className={styles.formbtn}>
            <Button
              onClick={onSubmitHandler}
              loading={isOrderLoading}
              disabled={
                isEmpty(state.addPlantName) ||
                isEmpty(state.totalQuantity) ||
                isEmpty(state.description) ||
                state.totalQuantity <= 0
              }
              type="primary"
              title="Save"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestOrder;
