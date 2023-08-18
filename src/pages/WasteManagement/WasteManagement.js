import React, { useEffect, useRef, useState } from "react";
import styles from "./WasteManagement.module.css";
import { BackButton, Button, Dropdown, Input, Toaster } from "../../components";
import { AiOutlineClose } from "react-icons/ai";
import DropZone from "../../components/Dropzone/Dropzone";
import { MIME_TYPES } from "@mantine/dropzone";
import { toast } from "react-toastify";
import { isEmpty } from "lodash";
import { useGetProcurementMutation, useReportDamageMutation } from "../../services/procurement.services";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import TextArea from "../../components/TextArea";
const initialState = {
    addPlantName:{},
    plantImages: [],
    damagedQty: '',
    comments : ""
}
const WasteManagement = () => {
    const damageRef = useRef()
    const [{addPlantName, plantImages, damagedQty, comments }, setState] = useState(initialState);
    const navigate = useNavigate()
    const [search] = useSearchParams()
    const procId = search.get('id');
    const [
        reportDamage,
        {
          isLoading,
          isError,
          isSuccess,
        },
      ]= useReportDamageMutation()
      
    const [getProcurement] = useGetProcurementMutation() 

    useEffect(()=>{
        if(procId){
             getProcurement({id: procId}).then(res=>{
                const data = res.data
                const plantData = {
                    label: data?.names?.en?.name,
                    value: data?._id,
                    meta: {...data}
                }
                setState(prev=>({
                    ...prev,
                    addPlantName: plantData
                }))
               
                // damageRef.current
             }).catch(err=>{
               
             })
        }
    }, [procId])

    const dropDownChangeHandler = (event, id) => {
        setState((prev) => {
          return {
            ...prev,
            [id]: event,
          };
        });
      };

      const inputChangeHandler = (event, id) => {
        setState((prev) => {
          return {
            ...prev,
            [id]: event.target.value,
          };
        });
      };

      const handlePlantimageSelect = (file) => {
        setState((prev) => {
          let updated = [...prev.plantImages, ...file];
    
          const uniqueArr = Array.from(new Set(updated.map((a) => a.path))).map(
            (path) => {
              return updated.find((a) => a.path === path);
            }
          );
          return{
            ...prev,
            plantImages: uniqueArr,
          }
          
        });
      };

      const handlePlantImageRemove = (index) => {
        setState((prev) => {
          let updated = [...prev.plantImages];
          updated.splice(index, 1);
          return {
            ...prev,
            plantImages: updated
          };
        });
      };

    const buttonDisable = !addPlantName || !damagedQty || isEmpty(plantImages)

    const onSubmit = async ()=>{
        const formdata = new FormData();
        const body = {
            damagedQuantity: damagedQty
        }
        formdata.append("body", JSON.stringify(body));
  
        plantImages.forEach((img) => {
          formdata.append("images", img);
        });
        const res = await reportDamage({ body: formdata, id: addPlantName.value });
        if (res.error) {
            toast.error(res.error?.data?.error);
          } else {
            toast.success("Damage Reported Successfully!");
            setTimeout(() => {
              navigate("../dashboard");
            }, 3000);
          }
    }

    return (
        <div>
            <div>
                <BackButton navigateTo={"/authorised/dashboard/waste-management"} />
            </div>
            <div className={styles.wrapper}>
                <h1 className={styles.header}>Waste Management</h1>
                <Toaster />
                <form className={styles.innerWrapper}>
                    <Dropdown 
                        title="Plant Name" 
                        placeholder="Select Role" 
                        url="/api/procurements/getAll?isList=true&isAll=true"
                        id="addPlantName"
                        apiDataPath={{ label: "names.en.name", value: "_id" }} 
                        onChange={dropDownChangeHandler}
                        value={addPlantName}
                        minInputToFireApi={3}
                        required/>

                    <Input title="Expected Remaining Quantity" type="number" disabled value={addPlantName?.meta?.remainingQuantity} />
                    <Input id="damagedQty" title="Damaged Quantity" type="number" value={damagedQty} onChange={inputChangeHandler} />
                    <TextArea
                        value={comments}
                        id="comments"
                        onChange={inputChangeHandler}
                        title="Comments"
                        rows={4}
                        name="comments"
                        required
                     />
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
            {plantImages.length < 3 && (
              <DropZone
                onDrop={(files) => {
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
                    <div className={styles.formButton}>
                        <Button loading={isLoading} onClick={onSubmit} type="primary" title="Save" buttonType="submit" disabled={buttonDisable} />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WasteManagement;
