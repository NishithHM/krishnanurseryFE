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
import { useUpdateProcurementsMutation } from "../../services/procurement.services";
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

const AddProcurement = () => {
  const initialState = {
    totalQuantity: "",
    totalAmount: "",
    description: "",
    addPlantName: {},
    addPlantCategory: [],
    addVendorName: {},
    addVendorContact: "",
    addPlantKannada: "",
    disabledVendorContact: false,
    errorFields: [],
    isNameInKannada: false,
    addProcurementError: [],
    submitDisabled: false,
  };

  const navigate = useNavigate();
  const [state, setState] = useState(initialState);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [plantImages, setPlantImages] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [firstLoad, setFirstLoad] = useState(true);
  const [
    updateProcurements,
    {
      isLoading: isLoadingUpdate,
      isError: isErrorUpdate,
      isSuccess: isSuccessUpdate,
    },
  ] = useUpdateProcurementsMutation();
  const [createProcurements, { isLoading, isError, isSuccess }] =
    useCreateProcurementsMutation();
  const categories = useGetAllCategoriesQuery({ sortType: 1 });

  const formatCategoryData = (data) => {
    const res = data.map((item) => ({
      value: item._id,
      label: item.names.en.name,
    }));
    return res;
  };

  useEffect(() => {
    if (categories.status === "fulfilled" && firstLoad) {
      setFirstLoad(false);
      setCategoryList(formatCategoryData(categories.data));
    }
  }, [categories]);

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

  useEffect(() => {
    let plantCategories;
    if (!state.addPlantName?.__isNew__) {
      plantCategories =
        state.addPlantName?.meta?.categories?.map((ele) => {
          return {
            label: ele.name,
            value: ele._id,
          };
        }) || [];
    }
    setState((prev) => ({
      ...prev,
      isNameInKannada: state.addPlantName?.__isNew__,
      addPlantCategory: state.addPlantName?.__isNew__
        ? prev.addPlantCategory
        : plantCategories,
    }));
  }, [state.addPlantName?.value]);

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      addVendorContact: state.addVendorName?.meta?.contact,
      disabledVendorContact: state.addVendorName?.__isNew__ ? false : true,
    }));
  }, [state.addVendorName?.value]);

  const onSubmitHandler = async () => {
    const body = {};
    body.totalQuantity = +state.totalQuantity;
    body.totalPrice = +state.totalAmount;
    body.description = state.description;
    body.vendorName = state.addVendorName.label;
    body.vendorContact = state.addVendorContact;
    if (!state.addVendorName?.__isNew__) {
      body.vendorId = state.addVendorName?.value;
    }
    if (body.totalQuantity < 0) {
      return toast.error("Total Quantity shouldn't be negative number");
    }
    if (body.totalPrice < 0) {
      return toast.error("Total price shouldn't be negative number");
    }
    if (!invoiceFile) {
      return toast.error("Select File");
    }
    if (plantImages.length == 0) {
      return toast.error("Upload atleast one plant image.");
    }
    body.categories = state.addPlantCategory.map((ele) => {
      return {
        _id: ele.value,
        name: ele.label,
      };
    });
    setState((prev) => {
      return {
        ...prev,
        submitDisabled: true,
      };
    });
    if (state.addPlantName?.__isNew__) {
      body.nameInKannada = state.addPlantKannada;
      body.nameInEnglish = state.addPlantName.label;

      const formdata = new FormData();
      formdata.append("body", JSON.stringify(body));
      formdata.append("invoice", invoiceFile);

      plantImages.forEach((img) => {
        formdata.append("invoice", img);
      });
      console.log(formdata);
      const res = await createProcurements({ body: formdata });

      if (res.error) {
        toast.error("Unable to Add...");
        setState((prev) => {
          return {
            ...prev,
            addProcurementError: _.isArray(res.error?.data)
              ? res.error?.data
              : [res.error?.data?.error],
            submitDisabled: false,
          };
        });
      } else {
        toast.success("Procurement Created Successfully!");

        setState((prev) => {
          return {
            ...prev,
            addProcurementError: [],
          };
        });
        setTimeout(() => {
          navigate("../dashboard");
        }, 3000);
      }
    } else {
      const id = state.addPlantName?.value;
      const formdata = new FormData();
      formdata.append("body", JSON.stringify(body));
      formdata.append("invoice", invoiceFile);

      plantImages.forEach((img) => {
        formdata.append("invoice", img);
      });
      console.log(formdata);
      const res = await updateProcurements({ body: formdata, id });

      if (res.error) {
        toast.error("Unable to Add...");
        setState((prev) => {
          return {
            ...prev,
            addProcurementError: _.isArray(res.error?.data)
              ? res.error?.data
              : [res.error?.data?.error],
            submitDisabled: false,
          };
        });
      } else {
        toast.success("Procurement Created Successfully!");
        setTimeout(() => {
          navigate("../dashboard");
        }, 3000);
      }
    }
  };

  const onError = ({ id, isError }) => {
    if (isError) {
      setState((prev) => ({
        ...prev,
        errorFields: _.uniq([...prev.errorFields, id]),
      }));
    } else {
      const newErrorFields = state.errorFields.filter((ele) => id != ele);
      setState((prev) => ({
        ...prev,
        errorFields: newErrorFields,
      }));
    }
  };
  const tableBody = useMemo(
    () => getTableBody(state.addPlantName),
    [state.addPlantName?.value]
  );

  const handlePlantimageSelect = (file) => {
    setPlantImages((prev) => {
      let updated = [...prev, ...file];

      const uniqueArr = Array.from(new Set(updated.map((a) => a.path))).map(
        (path) => {
          return updated.find((a) => a.path === path);
        }
      );
      return uniqueArr;
    });
  };
  const handlePlantImageRemove = (index) => {
    setPlantImages((prev) => {
      let updated = [...prev];
      updated.splice(index, 1);

      return updated;
    });
  };

  return (
    <div className={styles.addProcurementPage}>
      <Toaster />
      <div>
        <BackButton navigateTo={"/authorised/dashboard"} />
      </div>

      <div className={styles.outerWrapper}>
        <h1 className={styles.header}>Add Procurement</h1>
        <div className={styles.innerWrapper}>
          <Dropdown
            url="/api/procurements/getAll?isList=true"
            id="addPlantName"
            apiDataPath={{ label: "names.en.name", value: "_id" }}
            title="Plant Name"
            onChange={dropDownChangeHandler}
            value={state.addPlantName}
            canCreate
            required
          />
          {state.isNameInKannada && (
            <Input
              value={state.addPlantKannada}
              id="addPlantKannada"
              type="text"
              onChange={inputChangeHandler}
              title="Plant Name in Kannada"
              required
              onError={onError}
              validation={(text) => text.length > 0}
              errorMessage="Please Enter new Plant in Kannada"
            />
          )}

          <Dropdown
            // url="/api/category/getAll"
            id="addPlantCategory"
            title="Plant Category"
            onChange={dropDownChangeHandler}
            value={state.addPlantCategory}
            required
            isMultiEnabled
            data={categoryList}
          />
          <Dropdown
            url="/api/vendors/getAll"
            id="addVendorName"
            apiDataPath={{ label: "name", value: "_id" }}
            title="Vendor Name"
            onChange={dropDownChangeHandler}
            value={state.addVendorName}
            canCreate
            required
          />
          <Input
            value={state.addVendorContact}
            id="addVendorContact"
            type="number"
            onChange={inputChangeHandler}
            title="Contact Number"
            required
            disabled={state.disabledVendorContact}
            validation={(number) => {
              return number.length === 10;
            }}
            onError={onError}
            errorMessage="Please Enter a Valid Number"
          />
          <div className={styles.inputWrapper}>
            <div className={styles.inputdiv}>
              <Input
                value={state.totalQuantity}
                id="totalQuantity"
                type="number"
                onChange={inputChangeHandler}
                title="Total Quantity"
                required
              />
            </div>
            <div className={styles.secondinputdiv}>
              <Input
                value={state.totalAmount}
                id="totalAmount"
                type="number"
                onChange={inputChangeHandler}
                title="Total Amount"
                onInput={(e) => {
                  if (e.target.value < 0) {
                    toast.error("Total Amount shouldn't be negative number");
                  }
                }}
                required
              />
            </div>
          </div>
          <TextArea
            value={state.description}
            id="description"
            onChange={inputChangeHandler}
            title="Description"
            rows={4}
            name="description"
            required
          />
          <div>
            <p style={{ fontSize: "22px", lineHeight: "35px", margin: 0 }}>
              Invoice{" "}
              <span
                style={{
                  color: "red",
                }}
              >
                *
              </span>
            </p>
            {invoiceFile ? (
              <div>
                <p style={{ fontSize: "18px" }}>File Selected</p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "2px dashed black",
                    borderRadius: "7px",
                    padding: "10px",
                    margin: 0,
                  }}
                >
                  <span>{invoiceFile.name}</span>

                  <AiOutlineClose onClick={() => setInvoiceFile(null)} />
                </div>
              </div>
            ) : (
              <Dropzone
                onDrop={(files) => {
                  console.log(files);
                  setInvoiceFile(files[0]);
                }}
                onReject={(files) =>
                  toast.error(files[0].errors[0].code.replaceAll("-", " "))
                }
                maxSize={3 * 1024 ** 2}
                maxFiles="1"
                multiple={false}
                accept={[MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.pdf]}
                maxFileSize="5"
              />
            )}
          </div>

          <div>
            <p style={{ fontSize: "22px", lineHeight: "35px", margin: 0 }}>
              Plant Image(s){" "}
              <span
                style={{
                  color: "red",
                }}
              >
                *
              </span>
            </p>

            {plantImages.length > 0 && (
              <div
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <p style={{ fontSize: "18px" }}>File Selected</p>
                {plantImages.map((image, index) => {
                  return (
                    <div key={index}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          border: "2px dashed black",
                          borderRadius: "7px",
                          padding: "10px",
                          margin: 0,
                        }}
                      >
                        <span>{image.name}</span>

                        <AiOutlineClose
                          onClick={() => handlePlantImageRemove(index)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {plantImages.length < 3 && (
              <Dropzone
                onDrop={(files) => {
                  // console.log(files);
                  handlePlantimageSelect(files);
                }}
                onReject={(files) => {
                  toast.error(files[0].errors[0].code.replaceAll("-", " "));
                }}
                maxSize={3 * 1024 ** 2}
                maxFiles="3"
                multiple={true}
                accept={[MIME_TYPES.png, MIME_TYPES.jpeg]}
                maxFileSize="5"
              />
            )}
          </div>
          <div className={styles.formbtn}>
            <Button
              onClick={onSubmitHandler}
              loading={isLoading || isLoadingUpdate}
              disabled={
                isEmpty(state.addPlantCategory) ||
                isEmpty(state.addPlantName) ||
                isEmpty(state.addVendorName) ||
                isEmpty(state.totalAmount) ||
                isEmpty(state.totalQuantity) ||
                state.errorFields.length > 0 ||
                state.submitDisabled ||
                !invoiceFile
              }
              type="primary"
              title="Save"
            />
          </div>
          <span style={{ color: "red" }}>
            {state.addProcurementError.map((msg) => (
              <p>{msg}</p>
            ))}
          </span>
        </div>
      </div>
      <div className={styles.tableWrapper}>
        {tableBody.length > 0 && (
          <>
            <span className={styles.historyheader}>Procurement history</span>
            <Table
              data={[...tableHeader, ...tableBody]}
              onSortBy={(sort) => console.log(sort)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AddProcurement;
