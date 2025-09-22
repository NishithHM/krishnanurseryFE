import { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  Input,
  Toaster,
  BackButton,
} from "../../components";
import { isEmpty } from "lodash";
import TextArea from "../../components/TextArea";
import styles from "./AddProcurement.module.css";
import {
  useGetProcurementMutation,
  usePlaceOrderMutation,
  useGetOrderIdMutation,
  useGetInvoiceMutation,
} from "../../services/procurement.services";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useGetAllCategoriesQuery } from "../../services/categories.services";
import Datepicker from "../../components/Datepicker/Datepicker";
import { use } from "react";

/* /api/procurements/vendor-orders/:id GET --> [1235353, 345345455, 34534354]  ---> [{label:1235353, value: 1235353}]
 */
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

export const PlaceOrder = () => {
  const initialState = {
    plants: [
      {
        addPlantName: "",
        addPlantKannada: "",
        procurementId: 123,
        addPlantCategory: [],
        totalQuantity: 0,
        price: 0,
      },
    ],
    vendorName: "",
    vendorContact: "",
    vendorDeviation: "",
    vendorId: null,
    id: null,
    currentPaidAmount: 0,
    description: "",
    expectedDeliveryDate: null,
    orderId: "",
    orderDropdownValues: [],
    disabledVendorContact: false,
    disableExpectedDate: false,
    errorFields: [],
    isNameInKannada: false,
    addProcurementError: [],
    submitDisabled: true,
  };

  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();
  const procId = search.get("id");
  const requestedQuantity = search.get("requestedQuantity");
  const [state, setState] = useState(initialState);
  const [categoryList, setCategoryList] = useState([]);
  const [firstLoad, setFirstLoad] = useState(true);
  const [isFromAccept, setIsFromAccept] = useState(false);

  // API hooks
  const categories = useGetAllCategoriesQuery({ sortType: 1 });
  const [getProcurement] = useGetProcurementMutation();
  const [getOrderId] = useGetOrderIdMutation();
  const [getInvoice] = useGetInvoiceMutation();
  const [PlaceOrder, { isLoading: isOrderLoading }] = usePlaceOrderMutation();

  const isInhouseOrder =
    state.vendorContact && state.vendorContact === "9999999999";

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
  }, [categories]);

  // Vendor set from location state (edit mode)
  useEffect(() => {
    if (location.state) {
      setState((prev) => ({
        ...prev,
        vendorName: {
          label: location.state?.label,
          value: location.state?.value,
          meta: { contact: location?.state?.vendorContact },
        },
      }));
      setIsFromAccept(true);
    }
  }, [location.state]);

  const inputChangeHandler = (event, id) => {
    setState((prev) => ({ ...prev, [id]: event.target.value }));
  };

  const inputChangeHandlerNumber = (event, id) => {
    setState((prev) => ({
      ...prev,
      [id]: parseInt(event.target.value, 10),
    }));
  };

  // Handle plant changes
  const handlePlantChange = (index, field, value) => {
    const updatedPlants = [...state.plants];
    updatedPlants[index][field] = value;

      // Auto-fill categories when plant is selected
      if (field === "addPlantName" && value?.meta?.categories) {
         updatedPlants[index].addPlantCategory = value.meta.categories.map(
           (c) => ({
              label: c.name,   
              value: c._id,   
           })
         );
       }

     updateTotals(updatedPlants);
  };

  const handlePlantNumberChange = (index, field, value) => {
    const updatedPlants = [...state.plants];
    updatedPlants[index][field] = Number(value) || 0;
    updateTotals(updatedPlants);
  };

  const updateTotals = (plants) => {
    const totalQuantity = plants.reduce(
      (sum, plant) => sum + (Number(plant.totalQuantity) || 0),
      0
    );
    const totalPrice = plants.reduce(
      (sum, plant) => sum + (Number(plant.price) || 0),
      0
    );

    setState((prev) => ({
      ...prev,
      plants,
      totalQuantity,
      totalPrice,
    }));
  };

  // Validation function
  const validateForm = (plants, state) => {
    const arePlantsValid = plants.every(
      (p) =>
        (p.addPlantName?.label || p.addPlantKannada) &&
        Number(p.totalQuantity) > 0 &&
        Number(p.price) >= 0
    );

    return {
      arePlantsValid,
      isFormValid:
        arePlantsValid &&
        !isEmpty(plants) &&
        !isEmpty(state.vendorName) &&
        !isEmpty(state.description) &&
        !isEmpty(state.expectedDeliveryDate?.toString()),
    };
  };

  const addNewPlant = () => {
    const newPlants = [
      ...state.plants,
      {
        addPlantName: "",
        addPlantKannada: "",
        addPlantCategory: [],
        totalQuantity: 0,
        price: 0,
      },
    ];

    setState((prev) => ({
      ...prev,
      plants: newPlants,
      submitDisabled: true, // disable Save until validated again
    }));
  };

  const removePlant = (index) => {
    const newPlants = state.plants.filter((_, i) => i !== index);
    setState((prev) => ({
      ...prev,
      plants: newPlants,
    }));
  };

  const dropDownChangeHandler = (event, id) => {
    setState((prev) => ({
      ...prev,
      [id]: event,
    }));
  };

  const dateChangeHandler = (event) => {
    setState((prev) => ({
      ...prev,
      expectedDeliveryDate: event,
    }));
  };

  const onError = (error) => toast.error(error);

  const onSubmitHandler = async () => {
    const plantsPayload = state.plants.map((p) => ({
      nameInEnglish:
        p.addPlantName?.meta?.names?.en?.name || p.addPlantKannada,
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

  // --- Effects


  // Autofill plant details from procurementId + requestedQuantity
  useEffect(() => {
    if (!procId) return;

    getProcurement({ id: procId })
      .then((res) => {
        const data = res.data;
        const plantData = {
          label: data?.names?.en?.name,
          value: data?._id,
          meta: { ...data },
        };

        setState((prev) => {
          const updatedPlants = [...prev.plants];
          updatedPlants[0] = {
            ...updatedPlants[0],
            addPlantName: plantData,
            addPlantKannada: data?.names?.ka?.name || updatedPlants[0].addPlantKannada,
            addPlantCategory: (data?.categories || []).map((c) => ({
              label: c.name,
              value: c._id,
            })),
            totalQuantity: Number(requestedQuantity) || updatedPlants[0].totalQuantity,
          };

          return {
            ...prev,
            plants: updatedPlants,
          };
        });

        setIsFromAccept(true);
      })
      .catch(() => {});
  }, [procId, requestedQuantity]);

  useEffect(() => {
    // whenever vendorName changes, reset the orderId
    setState((prev) => ({ ...prev, orderId: {}, orderDetails: {}}));

  }, [state.vendorName]);

  
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      vendorContact: state.vendorName?.meta?.contact,
      vendorDeviation:
        state.vendorName?.meta?.deviation === undefined
          ? ""
          : state.vendorName?.meta?.deviation &&
            state.vendorName?.meta?.deviation < 0
          ? `${state.vendorName.label || ""} owes you ${Math.abs(
              state.vendorName?.meta?.deviation
            )}`
          : `You owe ${state.vendorName.label || ""} ${Math.abs(
              state.vendorName?.meta?.deviation
            )} `,
      disabledVendorContact: state.vendorName?.__isNew__ ? false : true,
    }));

    if (state.vendorName?.value) {
      getOrderId({ id: state.vendorName?.value })
        .then((res) => {
          if (state.vendorName?.value) {
            const data = res?.data;
            const orderMap = data.map((ele, index) => {
              const isLast = index === data.length - 1 ? "(new)" : "";
              return {
                label: `${ele} ${isLast}`,
                value: ele,
              };
            });
            setState((prev) => ({
              ...prev,
              orderDropdownValues: orderMap,
            }));
          }
        })
        .catch(() => {});
    }
  }, [state.vendorName?.value]);

  useEffect(() => {
    if (isInhouseOrder) {
      setState((prev) => ({
        ...prev,
        expectedDeliveryDate: dayjs().format("DD-MM-YYYY"),
      }));
    }
  }, [isInhouseOrder]);

  useEffect(() => {
    const getOrderDetails = async () => {
      if (state.orderId?.value) {
        const { data } = await getInvoice({
          id: state.orderId?.value,
          page: "placeOrder",
        });
        setState((prev) => ({
          ...prev,
          orderDetails: data,
          expectedDeliveryDate: dayjs(data?.expectedDeliveryDate).toDate(),
          disableExpectedDate: data?.expectedDeliveryDate ? true : false,
        }));
      }
    };
    getOrderDetails();
  }, [state.orderId?.value]);

  // Re-run validation whenever state changes
  useEffect(() => {
    const { isFormValid } = validateForm(state.plants, state);
    if (isFormValid) {
      setState((prev) => ({ ...prev, submitDisabled: false }));
    }
  }, [
    state.plants,
    state.vendorName,
    state.description,
    state.expectedDeliveryDate,
  ]);

  const isSubmitDisabled = state.submitDisabled;
  const isSubmitDisabledWithInHouse = state.submitDisabled;

  return (
    <div className={styles.addProcurementPage}>
      <Toaster />
      <div>
        <BackButton navigateTo={"/authorised/dashboard/orders"} />
      </div>

      <div className={styles.outerWrapper}>
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
          {state.plants.map((plant, index) => (
            <div key={index}>
              <div className={styles.plantBtnWrapper}>
              <Dropdown
                url="/api/procurements/getAll?isList=true&isAll=true"
                id={`addPlantName-${index}`}
                apiDataPath={{ label: "names.en.name", value: "_id" }}
                title="Plant Name"
                onChange={(val) =>
                  handlePlantChange(index, "addPlantName", val)
                }
                value={plant.addPlantName}
                canCreate={true}
                required
                // disabled={isFromAccept}
              />
              <div className={styles.crossBtn}>
                {state.plants.length > 1 && (
                  <FontAwesomeIcon style={{ cursor: "pointer" }} color="red" icon={faTrash} onClick={() => removePlant(index)} />
                )}
              </div>
              </div>
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
                onError={onError}
                validation={(text) => text.length > 0}
                errorMessage="Please Enter new Plant in Kannada"
                disabled={
                  state?.addPlantName?.meta?.names?.ka?.name && isFromAccept
                }
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
              <div className={styles.inputWrapper}>
                <div className={styles.inputdiv}>
                  <Input
                    value={plant.totalQuantity}
                    id="totalQuantity"
                    type="number"
                    onChange={(e) =>
                      handlePlantNumberChange(
                        index,
                        "totalQuantity",
                        e.target.value
                      )
                    }
                    title="Total Quantity"
                    required
                    min={0}
                  />
                </div>
                <div className={styles.secondinputdiv}>
                  <Input
                    value={plant.price}
                    id="price"
                    type="number"
                    onChange={(e) =>
                      handlePlantNumberChange(index, "price", e.target.value)
                    }
                    title="Price"
                    onBlur={(e) => {
                      if (e.target.value < 0) {
                        toast.error("Price shouldn't be negative number");
                      }
                    }}
                    disabled={isInhouseOrder}
                    {...(isInhouseOrder
                      ? { required: !isInhouseOrder }
                      : { required: true })}
                  />
                </div>
              </div>
            </div>
          ))}

          <Dropdown
            url="/api/vendors/getAll?type=NURSERY"
            id="vendorName"
            apiDataPath={{ label: "name", value: "_id" }}
            title="Vendor Name"
            onChange={dropDownChangeHandler}
            value={state.vendorName}
            disabled={isInhouseOrder}
            canCreate
            required
          />
          <Input
            value={state.vendorContact ?? ""}
            id="vendorContact"
            type="number"
            onChange={inputChangeHandler}
            title="Contact Number"
            required
            disabled={state.disabledVendorContact}
            validation={(number) => number.length === 10}
            onError={onError}
            errorMessage="Please Enter a Valid Number"
          />
          {state.vendorDeviation !== "" && (
            <Input
              value={state.vendorDeviation || ""}
              id="vendorDeviation"
              onChange={() => {}}
              title="Vendor Deviation Amount"
              required
              disabled
            />
          )}
          <Dropdown
            id="orderId"
            data={state.orderDropdownValues}
            title="Select Order Id"
            onChange={dropDownChangeHandler}
            value={state.orderId}
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
          <Input
            value={state.totalPrice || 0}
            id="orderTotalPrice"
            type="number"
            title="Total Order Price"
            disabled
          />
          <TextArea
            value={state.description ?? ""}
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
              disabled={
                isInhouseOrder ? isSubmitDisabledWithInHouse : isSubmitDisabled
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
