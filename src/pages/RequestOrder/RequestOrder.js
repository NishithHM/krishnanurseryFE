import React, {  useState } from "react";
import {
  Button,
  Dropdown,
  Input,
  Toaster,
  BackButton,
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const RequestOrder = () => {

  const initialPlant = {
    addPlantName: {},
    totalQuantity: 0,

  };
  const initialState = {

    plants: [initialPlant],
    description: "",
    submitDisabled: false,
    ownProduction: false,
  };

  const navigate = useNavigate();
  const [state, setState] = useState(initialState);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);

  const [RequestOrder, { isLoading: isOrderLoading }] =
    useRequestOrderMutation();

  
  
  const dropDownChangeHandler = (event, id) => {
    setState((prev) => {
      return {
        ...prev,
        [id]: event,
      };
    });
  };
   // --- Handlers
  const handlePlantChange = (index, field, value) => {
    const updatedPlants = [...state.plants];
    updatedPlants[index][field] = value;
    setState((prev) => ({ ...prev, plants: updatedPlants }));
  };

  const addNewPlant = () => {
    setState((prev) => ({
      ...prev,
      plants: [...prev.plants, { ...initialPlant }],
    }));
  };

  const removePlant = (index) => {
    const updatedPlants = state.plants.filter((_, i) => i !== index);
    setState((prev) => ({ ...prev, plants: updatedPlants }));
  };
  
  const updateHandler = async () => {
      const plantsPayload = state.plants.map((p) => ({
      
        nameInEnglish: p.addPlantName?.label,
        totalQuantity:  parseInt(p?.totalQuantity),
         ...(p.addPlantName?.__isNew__ ? {}  : { id: p.addPlantName?.value }), 
      }));
      console.log("PLants", plantsPayload);
      const body = {
        plants: plantsPayload,
        descriptionSales: state.description,
        ownProduction: state.ownProduction,
      };
  
      const response = await RequestOrder({ body });
      toast.success(response?.data?.message);
    };
  
    const onSubmitHandler = async () => {
      if (!state.plants.every((p) => p.addPlantName && p.totalQuantity > 0)) {
        return toast.error("Please fill all plant details");
      }
  
      await updateHandler();
      const remaining = state?.plants?.[0]?.addPlantName?.remainingQuantity ?? 0;
      console.log("LOGS", remaining);

      if (remaining >= 90) {
         setDeleteConfirmModal(true);
      } else {
        setTimeout(() => {
         navigate("../dashboard/orders");
         }, 1000);
      }

   };
 
  return (
      <>
        <div className={styles.addProcurementPage}>
          <Toaster />
          <div>
            <BackButton navigateTo={"/authorised/dashboard"} />
          </div>
  
          <div className={styles.outerWrapper}>
            <div className={styles.headerWrapper}>
              <h1 className={styles.header}>Request Order</h1>
              <div className={styles.btnStyles}>
                <Button
                  type="primary"
                  title="Add New Plant"
                  small={true}
                  onClick={addNewPlant}
                />
              </div>
            </div>
            <div className={styles.innerWrapper}>
              {state.plants.map((plant, index) => (
                <div key={index} className={styles.plantWrapper}>
                  <div className={styles.plantBtnWrapper}>
                    <Dropdown
                      className={styles.plantDropdown}
                      url="/api/procurements/getAll?isList=true&isAll=true"
                      id={`addPlantName-${index}`}
                      apiDataPath={{ label: "names.en.name", value: "_id" }}
                      title="Plant Name"
                      onChange={(val) =>
                        handlePlantChange(index, "addPlantName", val)
                      }
                      value={plant.addPlantName}
                      canCreate
                      required
                    />
                    <div className={styles.crossBtn}>
                      {state.plants.length > 1 && (
                        <FontAwesomeIcon 
                          style={{ cursor: "pointer" }} 
                          color="red" 
                          icon={faTrash} 
                          onClick={() => removePlant(index)} />
                      )}
                    </div>
                  </div>
                  <Input
                    className={styles.plantQuantity}
                    value={plant.totalQuantity}
                    id={`totalQuantity-${index}`}
                    type="number"
                    onChange={(e) =>
                      handlePlantChange(index, "totalQuantity", e.target.value)
                    }
                    title="Total Quantity"
                    required
                    min={0}
                  />
                </div>
              ))}
              <TextArea
                value={state.description}
                id="description"
                onChange={(e) =>
                  setState((prev) => ({ ...prev, description: e.target.value }))
                }
                title="Description"
                rows={4}
                name="description"
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
                    state.plants.some(
                      (p) =>
                        isEmpty(p.addPlantName) ||
                        !p.totalQuantity ||
                        p.totalQuantity <= 0
                    ) || isEmpty(state.description)
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
               state?.plants[0]?.addPlantName?.remainingQuantity ??  0
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
                `../dashboard/waste-management/add?id=${state.plants[0]?.addPlantName?.value}`
              );
            }}
          />
        </Modal>
      </>
    );
};

export default RequestOrder;
