import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dropdown,
  Input,
  Table,
  Toaster,
  BackButton,
  Dropzone,
  Modal,
  Alert,
  Checkbox,
} from "../../components";
import TextArea from "../../components/TextArea";
import styles from "./AddProcurement.module.css";
import { useRequestOrderMutation } from "../../services/procurement.services";
import { isEmpty } from "lodash";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const RequestOrder = () => {
  const initialState = {
    totalQuantity: 0,
    description: "",
    addPlantName: {},
    submitDisabled: false,
    ownProduction: false,
  };

  const navigate = useNavigate();
  const [state, setState] = useState(initialState);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);

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
    console.log(state?.addPlantName?.meta?.remainingQuantity);
    if (!state.addPlantName)
      return toast.error("Something Went Wrong! Please try again");

    updateHandler();

    if (state?.addPlantName?.meta?.remainingQuantity || 0 >= 90) {
      setDeleteConfirmModal(true);
    } else {
      if (state?.addPlantName?.meta?.remainingQuantity || 0 < 90) {
        setTimeout(() => {
          navigate("../dashboard/orders");
        }, 1000);
      }
    }
  };

  const updateHandler = async () => {
    const body = {
      nameInEnglish: state.addPlantName.label,
      descriptionSales: state.description,
      totalQuantity: parseInt(state.totalQuantity),
      ownProduction: state.ownProduction,
    };
    if (!state.addPlantName?.__isNew__) {
      body.id = state.addPlantName.value;
    }
    const response = await RequestOrder({ body });
    toast.success(response.data.message);
  };

  return (
    <>
      <div className={styles.addProcurementPage}>
        <Toaster />
        <div>
          <BackButton navigateTo={"/authorised/dashboard"} />
        </div>

        <div className={styles.outerWrapper}>
          <h1 className={styles.header}>Request Order</h1>
          <div className={styles.innerWrapper}>
            <Dropdown
              url="/api/procurements/getAll?isList=true&isAll=true"
              id="addPlantName"
              apiDataPath={{ label: "names.en.name", value: "_id" }}
              title="Plant Name"
              onChange={dropDownChangeHandler}
              value={state.addPlantName}
              canCreate={true}
              required
            />
            <TextArea
              value={state.description}
              id="description"
              onChange={inputChangeHandler}
              title="Description"
              rows={4}
              name="description"
              required
            />
            <Input
              value={state.totalQuantity}
              id="totalQuantity"
              type="number"
              onChange={inputChangeHandler}
              title="Total Quantity"
              required
            />
            <Checkbox
              onChange={dropDownChangeHandler}
              label="Check this if plant is grown in house"
              id="ownProduction"
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

      <Modal isOpen={deleteConfirmModal} contentLabel="Delete User">
        <Alert
          message={`Remaining plants in Inventory - ${
            state?.addPlantName?.meta?.remainingQuantity || 0
          }`}
          subMessage={"Update Waste Management?"}
          confirmBtnType="primary"
          confirmBtnLabel="Update"
          cancelBtnLabel="Skip"
          cancelLoading={isOrderLoading}
          handleCancel={() => {
            setDeleteConfirmModal(false);
            navigate("../dashboard/orders");
          }}
          handleConfirm={() => {
            setDeleteConfirmModal(false);
            navigate(
              `../dashboard/waste-management/add?id=${state.addPlantName?.value}`
            );
          }}
        />
      </Modal>
    </>
  );
};

export default RequestOrder;
