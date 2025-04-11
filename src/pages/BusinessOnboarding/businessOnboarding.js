import React, { useEffect, useState } from "react";
import { DatePicker } from "@mantine/dates";
import { Button, Footer, Header, Input, SelectPill } from "../../components";
import styles from "./businessOnboarding.module.css";
import { uniq } from "lodash";
import { useGetAllCategoriesQuery } from "../../services/categories.services";
import { useCreateBusinessCustomerOnboardingMutation } from "../../services/customer.service";
import { Toaster } from "../../components";
import { toast } from "react-toastify";
import {MediaQuery, createStyles} from "@mantine/core"
import { useGetPincodeDetailsMutation } from "../../services/common.services";

const BusinessOnboarding = () => {
  const defaultFormValues = {
    phone: "",
    name: "",
    businessName:'',
    dateOfBirth: "",
    category: [],
    errorFields: [],
    customerAddressLine1:"",
    customerAddressLine2: '',
    customerAddressPinCode: '',
    customerAddressPinCodeDetails: "",
    gstNumber:'',
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingAddressPinCode: "",
    shippingAddressPinCodeDetails:"",
    latitude: "",
    longitude: ""
  };
  const [formState, setFormState] = useState(defaultFormValues);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { data } = useGetAllCategoriesQuery({});

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
      );
    }
  }, []);


  const categoryOptions = data?.map((ele) => ele?.names?.en?.name);
  const [createBusinessCustomerOnboarding] = useCreateBusinessCustomerOnboardingMutation();
  const [getPincodeDetails] = useGetPincodeDetailsMutation()

  const validForm =
    formState.name &&
    formState.phone &&
    formState.category?.length &&
    !formState.errorFields.length &&
    formState.businessName.length &&
    formState.customerAddressLine1.length &&
    formState.customerAddressPinCode.length &&
    formState.shippingAddressLine1.length &&
    formState.shippingAddressPinCode.length

  const dateChangeHandler = (event) => {
    setFormState((prev) => {
      return {
        ...prev,
        dateOfBirth: event,
      };
    });
  };
  const categoryChangeHandler = (e) => {
    setFormState((prev) => {
      return {
        ...prev,
        category: e,
      };
    });
  };

  const inputChangeHanlder = (event, id) => {
    setFormState((prev) => {
      return {
        ...prev,
        [id]: event.target.value,
      };
    });
    if(id==="customerAddressPinCode"){
        onPincodeChange(event?.target.value, "customerAddressPinCode")
    }
    if(id==="shippingAddressPinCode"){
        onPincodeChange(event?.target.value, "shippingAddressPinCode")
    }
  };

  const onPincodeChange = async(val, field)=>{
    if(val.length === 6){
       const pinCodeData =  await getPincodeDetails({id:val})
       console.log(pinCodeData.data)
       setFormState((prev) => {
        return {
          ...prev,
          [`${field}Details`]: pinCodeData.data?.place,
        };
      });
    }
  }

  const inputErrorHandler = ({ id, isError }) => {
    if (isError) {
      setFormState((prev) => ({
        ...prev,
        errorFields: uniq([...prev?.errorFields, id]),
      }));
    } else {
      const newErrorFields = formState?.errorFields?.filter((ele) => id !== ele) || [];
      setFormState((prev) => ({
        ...prev,
        errorFields: newErrorFields,
      }));
    }
  };

  const formSubmitHandler = (event) => {
    event.preventDefault();
    if (validForm) {
      setFormSubmitted(true);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    const res = await createBusinessCustomerOnboarding({
      name: formState.name,
      phoneNumber: formState.phone,
      dob: formState?.dateOfBirth,
      categoryList: formState.category.map((ele) => {
        const { _id, names } = data.find((val) => val?.names?.en?.name === ele);
        return {
          id: _id,
          categoryNameInEnglish: ele,
          categoryNameInKannada: names?.ka?.name,
        };
      }),
      businessName: formState.businessName,
      customerAddressLine1:formState.customerAddressLine1,
      customerAddressLine2: formState.customerAddressLine2,
      customerAddressPinCode: formState.customerAddressPinCode,
      customerAddressPinCodeDetails: formState.customerAddressPinCodeDetails,
      gstNumber:formState.gstNumber,
      shippingAddressLine1: formState.shippingAddressLine1,
      shippingAddressLine2: formState.shippingAddressLine2,
      shippingAddressPinCode: formState.shippingAddressPinCode,
      shippingAddressPinCodeDetails:formState.shippingAddressPinCodeDetails,
      latitude: formState.latitude,
      longitude: formState.longitude
    });
    if (res.error) {
      toast.error(res?.error?.data.error);
    } else {
      toast.success("Thank You For Registering!!!");
      setFormState((prev)=>{
        return {
          ...prev,
          ...defaultFormValues
        }
      }
      
      )
      setTimeout(()=>{
        window.location.reload()
      }, 1000)
    }
  };

  const useStyles = createStyles((theme) => ({
    label : {
      fontSize: "20px",
      marginBottom: "2px",
      fontFamily: "Montserrat, sans-serif",

      [`@media only screen and (min-width: ${320}px) and (max-device-width: ${425}px)`] : {
         fontSize : "16px"
      }
    },
    input: {
      border: "none",
      borderBottom: "1.5px solid black",
      borderRadius: 0,
      fontSize: "18px",
      fontWeight: 400,
    },
  }));
  const { classes } = useStyles();
  return (
   
    <>
    <div className={styles.wrapper}>
      <Toaster />
      <form className={styles.innerWrapper} onSubmit={formSubmitHandler}>
        <Input
          title="Name"
          id="name"
          required={true}
          value={formState.name}
          type="text"
          errorMessage="Name must contain only Alphabets"
          validation={(name) => /[A-Za-z]/.test(name)}
          onChange={inputChangeHanlder}
          onError={inputErrorHandler}
        />

        <Input
          id="phone"
          type="number"
          errorMessage="Invalid Mobile Number"
          required
          validation={(number) => number.length === 10}
          value={formState.phone}
          onChange={inputChangeHanlder}
          title="Phone Number"
          onError={inputErrorHandler}
        />
        <div>
          <DatePicker
            classNames={{
              label : classes.label,
              input : classes.input
            }}
            placeholder="dd-mm-yyyy"
            label="Date Of Birth"
            inputFormat="DD/MM/YYYY"
            labelFormat="MMMM - YYYY"
            size="sm"
            withAsterisk
            value={formState.date}
            onChange={dateChangeHandler}
            clearable={false}
            maxDate={new Date()}
          />
        </div>
        <Input
          title="Business Name"
          id="businessName"
          required={true}
          value={formState.businessName}
          type="text"
          errorMessage="Name must contain only Alphabets"
          validation={(name) => /[A-Za-z]/.test(name)}
          onChange={inputChangeHanlder}
          onError={inputErrorHandler}
        />

        <Input
          title="Customer Address Line 1"
          id="customerAddressLine1"
          required={true}
          value={formState.customerAddressLine1}
          errorMessage="field cannot be empty"
          validation={(name) => name.length > 0}
          type="text"
          onChange={inputChangeHanlder}
          onError={inputErrorHandler}
        />

        <Input
          title="Customer Address Line 2"
          id="customerAddressLine2"
          value={formState.customerAddressLine2}
          type="text"
          onChange={inputChangeHanlder}
          onError={inputErrorHandler}
        />

        <Input
          title="Pincode"
          id="customerAddressPinCode"
          required={true}
          value={formState.customerAddressPinCode}
          errorMessage="invalid pin code"
          validation={(name) => name.length === 6}
          type="number"
          onChange={inputChangeHanlder}
          onError={inputErrorHandler}
        />

        <Input
          title="Area"
          id="customerAddressPinCodeDetails"
          required={true}
          value={formState.customerAddressPinCodeDetails}
          type="text"
          disabled
        />

        <Input
          title="GST Number"
          id="gstNumber"
          required={true}
          value={formState.gstNumber}
          errorMessage="invalid gst number"
          validation={(name) => /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d{1}[Z]{1}[A-Z\d]{1}$/.test(name)}
          type="text"
          onChange={inputChangeHanlder}
          onError={inputErrorHandler}
        />

        <Input
          title="Shipping Address Line 1"
          id="shippingAddressLine1"
          required={true}
          value={formState.shippingAddressLine1}
          errorMessage="field cannot be empty"
          validation={(name) => name.length > 0}
          type="text"
          onChange={inputChangeHanlder}
          onError={inputErrorHandler}
        />

        <Input
          title="Shipping Address Line 2"
          id="shippingAddressLine2"
          value={formState.shippingAddressLine2}
          type="text"
          onChange={inputChangeHanlder}
          onError={inputErrorHandler}
        />

        <Input
          title="Shipping Pincode"
          id="shippingAddressPinCode"
          required={true}
          value={formState.shippingAddressPinCode}
          errorMessage="invalid pin code"
          validation={(name) => name.length === 6}
          type="number"
          onChange={inputChangeHanlder}
          onError={inputErrorHandler}
        />

        <Input
          title="Area"
          id="shippingAddressPinCodeDetails"
          required={true}
          value={formState.shippingAddressPinCodeDetails}
          type="text"
          disabled
        />

        <Input
          title="Latitude"
          id="latitude"
          value={formState.latitude}
          type="text"
          onChange={inputChangeHanlder}
        />

        <Input
          title="Longitude"
          id="longitude"
          value={formState.longitude}
          type="text"
          onChange={inputChangeHanlder}
        />


        <div>
          <p
          className={styles.categoryText}
          >
            Category <span style={{ color: "red" }}>*</span>
          </p>
          <div className={styles.selectPill}>
          <SelectPill
            onChange={categoryChangeHandler}
            options={categoryOptions}
          />
          </div>
          {formSubmitted && formState.category.length === 0 && (
            <p style={{ color: "red", lineHeight: 0 }}>
              Select atleast one category
            </p>
          )}
        </div>
        <div className={styles.formButton}>
          <Button
            onClick={onSubmitHandler}
            type="primary"
            title="Save"
            buttonType="submit"
            disabled={!validForm}
          />
        </div>
      </form>
    </div>
    <Footer />
    </>
  );
};

export default BusinessOnboarding;
