import dayjs from "dayjs";
import _ from "lodash";
const requiredData = [
  "lastProcuredOn",
  "plantName",
  "totalQuantity",
  "remainingQuantity",
  "view",
];

const ViewDetials = ({onDetailClick, id}) =>{
    return (
        <span onClick={(e)=>onDetailClick(id)}
          style={{ color: "#539c64", fontWeight: "600", cursor: "pointer" }}
        >
          View Details
        </span>
      );
}
export const getProcurementListTableBody = (data, onDetailClick) => {
  // console.log(data)
  if (_.isEmpty(data)) {
    return [];
  } else {
    const history = data?.map((ele) => {
      const res = requiredData?.map((res) => {
        // console.log(ele)
        // console.log(res)
        if (res === "lastProcuredOn") {
          return { value: dayjs(ele[res]).format("DD/MM/YYYY") };
        } else if (res === "plantName") {
          return { value: ele?.names?.en?.name };
        } else if (res === "view") {
          return {
            value: <ViewDetials id={ele._id} onDetailClick={onDetailClick} />
          }
        } else {
          return { value: ele[res] };
        }
      });
      return res;
    });
    return history;
  }
};
