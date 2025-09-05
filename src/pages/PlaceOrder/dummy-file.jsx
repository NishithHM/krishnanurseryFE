import { useEffect, useState } from "react";
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
  useGetInvoiceMutation,
} from "../../services/procurement.services";
import { isEmpty } from "lodash";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useGetAllCategoriesQuery } from "../../services/categories.services";
import dayjs from "dayjs";
import Datepicker from "../../components/Datepicker/Datepicker";

export const PlaceOrder = () => {
  const initialState = {
    plants: [
      {
        addPlantName: {},
        addPlantKannada: "",
        addPlantCategory: [],
        totalQuantity: 0,
        price: 0,
      },
    ],
    vendorName: {},
    vendorContact: "",
    vendorId: null,
    id: null,
    currentPaidAmount: 0,
    description: "",
    expectedDeliveryDate: null,
    orderId: {},
    totalOrderQuantity: 0,
    totalOrderPrice: 0,
  };

  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();

  const [state, setState] = useState(initialState);
  const [categoryList, setCategoryList] = useState([]);
  const [firstLoad, setFirstLoad] = useState(true);

  const categories = useGetAllCategoriesQuery({ sortType: 1 });
  const [getProcurement] = useGetProcurementMutation();
  const [getOrderId] = useGetOrderIdMutation();
  const [getInvoice] = useGetInvoiceMutation();
  const [PlaceOrder, { isLoading: isOrderLoading }] = usePlaceOrderMutation();

  const isInhouseOrder =
    state.vendorContact && state.vendorContact === "9999999999";

  // Format categories
  const formatCategoryData = (data) =>
    data.map((item) => ({
      value: item._id,
      label: item.names.en.name,
    }));

  // Load categories
  useEffect(() => {
    if (categories.status === "fulfilled" && firstLoad) {
      setFirstLoad(false);
      setCategoryList(formatCategoryData(categories.data));
    }
  }, [categories, firstLoad]);

  // Auto-calc total qty + total price
  useEffect(() => {
    const totalOrderQuantity = state.plants.reduce(
      (sum, p) => sum + Number(p.totalQuantity || 0),
      0
    );
    const totalOrderPrice = state.plants.reduce(
      (sum, p) => sum + Number(p.price || 0),
      0
    );

    setState((prev) => ({
      ...prev,
      totalOrderQuantity,
      totalOrderPrice,
    }));
  }, [state.plants]);

  // Handle plant changes
  const handlePlantChange = (index, field, value) => {
    const updatedPlants = [...state.plants];
    updatedPlants[index][field] = value;
    setState((prev) => ({
      ...prev,
      plants: updatedPlants,
    }));
  };

  // Add new plant row
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

  // Handle numeric inputs (plant-specific)
  const inputChangeHandlerNumber = (event, index, field) => {
    const value = parseInt(event.target.value || 0, 10);
    if (value < 0) {
      toast.error(`${field} cannot be negative`);
      return;
    }
    handlePlantChange(index, field, value);
  };

  // Handle dropdowns
  const dropDownChangeHandler = (event, id) => {
    setState((prev) => ({
      ...prev,
      [id]: event,
    }));
  };

  // Handle dates
  const dateChangeHandler = (event) => {
    setState((prev) => ({
      ...prev,
      expectedDeliveryDate: event,
    }));
  };

  // Submit handler
  const onSubmitHandler = async () => {
    const plantsPayload = state.plants.map((p) => ({
      nameInEnglish: p.addPlantName?.label,
      nameInKannada:
        p.addPlantName?.meta?.names?.ka?.name || p.addPlantKannada,
      categories: p.addPlantCategory.map((c) => ({
        name: c.label,
        _id: c.value,
      })),
      totalQuantity: Number(p.totalQuantity),
      totalPrice: Number(p.price),
      ...(p.addPlantName?.__isNew__
        ? {}
        : { procurementId: p.addPlantName.value }),
    }));

    const body = {
      plants: plantsPayload,
      vendorName: state.vendorName.label,
      vendorContact: state.vendorContact,
      description: state.description,
      expectedDeliveryDate: state.expectedDeliveryDate,
      currentPaidAmount: state.currentPaidAmount,
      orderId: state.orderId?.value,
      totalOrderPrice: state.totalOrderPrice,
      totalOrderQuantity: state.totalOrderQuantity,
    };

    if (search.get("orderId")) body.id = search.get("orderId");
    if (!state?.vendorName?.__isNew__) body.vendorId = state.vendorName.value;

    const response = await PlaceOrder({ body });
    if (response["error"] !== undefined) {
      return toast.error(response.error.data.error);
    }
    toast.success(response.data.message);
    setTimeout(() => {
      navigate("../dashboard/orders");
    }, 1000);
  };

  // Render
  return (
    <div className={styles.addProcurementPage}>
      <Toaster />
      <div>
        <BackButton navigateTo={"/authorised/dashboard/orders"} />
      </div>

      <div className={styles.outerWrapper}>
        {/* Add Plant Button */}
        <div className={styles.btnWidth}>
          <Button
            type="primary"
            title="Add New Plant"
            small={true}
            onClick={addNewPlant}
          />
        </div>
        <br />

        <div className={styles.innerWrapper}>
          {/* Plants */}
          {state.plants.map((plant, index) => (
            <div key={index} className={styles.plantBlock}>
              <Dropdown
                url="/api/procurements/getAll?isList=true&isAll=true"
                id={`addPlantName-${index}`}
                apiDataPath={{ label: "names.en.name", value: "_id" }}
                title="Plant Name"
                onChange={(val) =>
                  handlePlantChange(index, "addPlantName", val)
                }
                value={plant.addPlantName || {}}
                canCreate={true}
                required
              />
              <Input
                value={
                  plant?.addPlantName?.meta?.names?.ka?.name ||
                  plant.addPlantKannada ||
                  ""
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
                value={plant.addPlantCategory || []}
                required
                isMultiEnabled
                data={categoryList}
                onChange={(val) =>
                  handlePlantChange(index, "addPlantCategory", val)
                }
              />
              <div className={styles.inputWrapper}>
                <div className={styles.inputdiv}>
                  <Input
                    value={plant.totalQuantity ?? 0}
                    id={`totalQuantity-${index}`}
                    type="number"
                    onChange={(e) =>
                      inputChangeHandlerNumber(e, index, "totalQuantity")
                    }
                    title="Total Quantity"
                    required
                  />
                </div>
                <div className={styles.secondinputdiv}>
                  <Input
                    value={plant.price ?? 0}
                    id={`price-${index}`}
                    onChange={(e) =>
                      inputChangeHandlerNumber(e, index, "price")
                    }
                    type="number"
                    title="Price"
                    disabled={isInhouseOrder}
                    required={!isInhouseOrder}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Vendor */}
          <Dropdown
            url="/api/vendors/getAll?type=NURSERY"
            id="vendorName"
            apiDataPath={{ label: "name", value: "_id" }}
            title="Vendor Name"
            onChange={(val) => dropDownChangeHandler(val, "vendorName")}
            value={state.vendorName || {}}
            canCreate
            required
          />
          <Input
            value={state.vendorContact || ""}
            id="vendorContact"
            type="number"
            onChange={(e) =>
              setState((prev) => ({ ...prev, vendorContact: e.target.value }))
            }
            title="Contact Number"
            required
          />

          {/* Order Dropdown */}
          <Dropdown
            id="orderId"
            data={state.orderDropdownValues || []}
            title="Select Order Id"
            onChange={(val) => dropDownChangeHandler(val, "orderId")}
            value={state.orderId || {}}
            required
          />
          <Datepicker
            label={"Expected Delivery Date"}
            value={state.expectedDeliveryDate}
            onChange={dateChangeHandler}
            minDate={new Date()}
            clearable={true}
            isRequired
          />

          {/* Show Total Order Quantity + Total Order Price */}
          <div className={styles.inputWrapper}>
            <div className={styles.inputdiv}>
              <Input
                value={state.totalOrderQuantity ?? 0}
                id="totalOrderQuantity"
                type="number"
                title="Total Quantity (All Plants)"
                readOnly
              />
            </div>
            <div className={styles.secondinputdiv}>
              <Input
                value={state.totalOrderPrice ?? 0}
                id="totalOrderPrice"
                type="number"
                title="Total Order Price (All Plants)"
                readOnly
              />
            </div>
          </div>

          <TextArea
            value={state.description || ""}
            id="description"
            onChange={(e) =>
              setState((prev) => ({ ...prev, description: e.target.value }))
            }
            title="Description"
            rows={4}
            name="description"
            required
          />

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
