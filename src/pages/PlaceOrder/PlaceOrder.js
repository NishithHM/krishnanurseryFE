import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dropdown,
  Input,
  Toaster,
  BackButton,
} from "../../components";
import TextArea from "../../components/TextArea";
import styles from "./AddProcurement.module.css";
import {
  useGetProcurementMutation,
  usePlaceOrderMutation,
  useGetOrderIdMutation,
} from "../../services/procurement.services";
import { isEmpty } from "lodash";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useGetAllCategoriesQuery } from "../../services/categories.services";
import dayjs from "dayjs";
import { useGetInvoiceMutation } from "../../services/procurement.services";
import Datepicker from "../../components/Datepicker/Datepicker";

//  UPDATED PlaceOrder for multi-plant support

export const PlaceOrder = () => {
  // ---------------------------
  // TASK 1: Update initial state
  // ---------------------------
  const initialState = {
    plants: [
      {
        addPlantName: {},
        addPlantKannada: "",
        addPlantCategory: [],
        totalQuantity: 0,
        price: 0, // renamed from totalPrice
      },
    ],
    totalPrice: 0, // NEW: aggregate total price across plants
    description: "",
    addVendorName: {},
    addVendorContact: "",
    vendorDeviation: "",
    expectedDeliveryDate: "",
    currentPaidAmount: 0,
    disabledVendorContact: false,
    errorFields: [],
    isNameInKannada: false,
    addProcurementError: [],
    submitDisabled: false,
    orderId: {},
    orderDropdownValues: [],
    orderDetails: {},
    disableExpectedDate: false,
  };

  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();
  const procId = search.get("id");
  const requestedQuantity = search.get("requestedQuantity");
  const [getProcurement] = useGetProcurementMutation();
  const [state, setState] = useState(initialState);
  const [categoryList, setCategoryList] = useState([]);
  const [firstLoad, setFirstLoad] = useState(true);
  const [getInvoice] = useGetInvoiceMutation();
  const [isFromAccept, setIsFromAccept] = useState(false);

  const categories = useGetAllCategoriesQuery({ sortType: 1 });
  const [getOrderId] = useGetOrderIdMutation();
  const [PlaceOrder, { isLoading: isOrderLoading }] = usePlaceOrderMutation();

  const formatCategoryData = (data) => {
    return data.map((item) => ({
      value: item._id,
      label: item.names.en.name,
    }));
  };

  // TASK 2: Add handler to update specific plant row

  const handlePlantChange = (index, field, value) => {
    const updatedPlants = [...state.plants];
    updatedPlants[index][field] = value;

    // Update aggregate total price
    const totalPrice = updatedPlants.reduce(
      (sum, plant) => sum + Number(plant.price || 0),
      0
    );

    setState((prev) => ({
      ...prev,
      plants: updatedPlants,
      totalPrice,
    }));
  };

  // TASK 3: Add handler to add new plant row .

  const addNewPlant = () => {
    setState((prev) => ({
      ...prev,
      plants: [
        ...prev.plants,
        {
          addPlantName: {},
          addPlantKannada: "",
          addPlantCategory: [],
          totalQuantity: 0,
          price: 0,
        },
      ],
    }));
  };

  
  // Build payload with plants array

  const onSubmitHandler = async () => {
    const plantsPayload = state.plants.map((p) => {
      return {
        nameInEnglish: p.addPlantName?.label,
        nameInKannada:
          p.addPlantName?.meta?.names?.ka?.name || p.addPlantKannada,
        categories: p.addPlantCategory.map((c) => ({
          name: c.label,
          _id: c.value,
        })),
        totalQuantity: p.totalQuantity,
        totalPrice: p.price,
        ...(p.addPlantName?.__isNew__ ? {} : { procurementId: p.addPlantName.value }),
      };
    });

    const body = {
      plants: plantsPayload,
      vendorName: state.addVendorName.label,
      vendorContact: state.addVendorContact,
      description: state.description,
      expectedDeliveryDate: state.expectedDeliveryDate,
      currentPaidAmount: state.currentPaidAmount,
      orderId: state.orderId?.value,
      totalPrice: state.totalPrice, // aggregate
    };

    if (search.get("orderId")) {
      body.id = search.get("orderId");
    }
    if (!state?.addVendorName?.__isNew__) {
      body.vendorId = state.addVendorName.value;
    }

    const response = await PlaceOrder({ body });
    if (response["error"] !== undefined) {
      return toast.error(response.error.data.error);
    }
    toast.success(response.data.message);
    setTimeout(() => {
      navigate("../dashboard/orders");
    }, 1000);
  };

  // ---------------------------
  // TASK 5: Render dynamic plants UI
  // ---------------------------
  return (
    <div className={styles.addProcurementPage}>
      <Toaster />
      <div>
        <BackButton navigateTo={"/authorised/dashboard/orders"} />
      </div>

      <div className={styles.outerWrapper}>
        {/* Add Plant Button */}
        <div className={styles.btnWidth}>
          <Button type="primary" title="Add New Plant"  small={true}  onClick={addNewPlant}/>
        </div>
        <br />
        <div className={styles.innerWrapper}>
          {/* Loop over plants array */}
          {state.plants.map((plant, index) => (
            <div key={index} className={styles.plantBlock}>
              <Dropdown
                url="/api/procurements/getAll?isList=true&isAll=true"
                id={`addPlantName-${index}`}
                apiDataPath={{ label: "names.en.name", value: "_id" }}
                title="Plant Name"
                onChange={(val) => handlePlantChange(index, "addPlantName", val)}
                value={plant.addPlantName}
                canCreate={true}
                required
                disabled={isFromAccept}
              />
              <Input
                value={
                  plant?.addPlantName?.meta?.names?.ka?.name ||
                  plant.addPlantKannada
                }
                id={`addPlantKannada-${index}`}
                type="text"
                onChange={(e) =>
                  handlePlantChange(index, "addPlantKannada", e.target.value)
                }
                title="Plant Name in Kannada"
                required
              />
              <Dropdown
                id={`addPlantCategory-${index}`}
                title="Plant Category"
                value={plant.addPlantCategory}
                required
                isMultiEnabled
                data={categoryList}
                onChange={(val) =>
                  handlePlantChange(index, "addPlantCategory", val)
                }
              />
              <Input
                value={plant.totalQuantity}
                id={`totalQuantity-${index}`}
                type="number"
                onChange={(e) =>
                  handlePlantChange(index, "totalQuantity", Number(e.target.value))
                }
                title="Total Quantity"
                required
              />
              <Input
                value={plant.price}
                id={`price-${index}`}
                type="number"
                onChange={(e) =>
                  handlePlantChange(index, "price", Number(e.target.value))
                }
                title="Price"
                required
              />
            </div>
          ))}
          {/* Vendor Details */}
          <Dropdown
            url="/api/vendors/getAll?type=NURSERY"
            id="addVendorName"
            apiDataPath={{ label: "name", value: "_id" }}
            title="Vendor Name"
            onChange={(val) => setState((prev) => ({ ...prev, addVendorName: val }))}
            value={state.addVendorName}
            canCreate
            required
          />
          <Input
            value={state.addVendorContact}
            id="addVendorContact"
            type="number"
            onChange={(e) =>
              setState((prev) => ({ ...prev, addVendorContact: e.target.value }))
            }
            title="Contact Number"
            required
          />

          <Datepicker
            label={"Expected Delivery Date"}
            value={state.expectedDeliveryDate}
            onChange={(val) =>
              setState((prev) => ({ ...prev, expectedDeliveryDate: val }))
            }
            minDate={new Date()}
            clearable={true}
            isRequired
          />

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
            {/* Aggregate Total Price */}
          <div className={styles.totalPrice}>
            <b>Total Order Price:</b> {state.totalPrice}
          </div>
          <div className={styles.formbtn}>
            <Button
              onClick={onSubmitHandler}
              loading={isOrderLoading}
              type="primary"
              title="Save"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
