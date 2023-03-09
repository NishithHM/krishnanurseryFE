import _ from "lodash";
import dayjs from "dayjs";

const requiredData = [
    "Category Name",
    "Created On",
    "delete"
  ];

  const Delete = ({id, onDeleteClick })=>{
    return(
        <span onClick={(e)=>onDeleteClick(id)} style={{color:"#FF2400", fontWeight: "600", cursor: "pointer"}}>Delete</span>
    )
  }

  export const getCategoriesTableBody = (data, onDeleteClick)=>{
    if(_.isEmpty(data)){
        return []
    } else{
        const history = data?.map((ele)=>{
           const res = requiredData?.map((res)=>{
            if(res === "Created On"){
                return {value: dayjs(ele[res]).format("DD/MM/YYYY")}
            } else if(res === "Category Name"){
                return{value: ele?.names?.en?.name}
            } else if("delete"){
                return{
                    value: <Delete onDeleteClick={onDeleteClick} id={ele._id}/>
                }
            } else{
                return { value: ele[res] };
            }
           })
           return res;
        })
        return history
    }
  }