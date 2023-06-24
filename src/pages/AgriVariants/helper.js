import _ from "lodash";
import dayjs from "dayjs";

const requiredData = ["Variant Type", "Variant Name", "delete", "edit"];

const Delete = ({ id, onDeleteClick }) => {
  return (
    <span
      onClick={(e) => onDeleteClick(id)}
      style={{ color: "#FF2400", fontWeight: "600", cursor: "pointer" }}
    >
      Delete
    </span>
  );
};

const Edit = ({ id, onEditClick }) => {
  return (
    <span
      onClick={(e) => onEditClick(id)}
      style={{ color: "#539c64", fontWeight: "600", cursor: "pointer" }}
    >
      Edit
    </span>
  );
};

export const initialCategory = { id: "variant", value: "" };

export const getVariantsBody = (data, onDeleteClick, onEditClick) => {
  if (_.isEmpty(data)) {
    return [];
  } else {
    const history = data?.map((ele) => {
      console.log(ele);
      const res = requiredData?.map((res) => {
        console.log(res, "res");
        if (res === "Variant Name") {
          return { value: ele?.name };
        } else if (res === "Variant Type") {
          return { value: ele?.type };
        } else if (res === "delete") {
          return {
            value: (
              <span>
                <Delete onDeleteClick={onDeleteClick} id={ele._id} /> &nbsp;/
                &nbsp;
                <Edit onEditClick={onEditClick} id={ele._id} />
              </span>
            ),
          };
        } else {
          return { value: ele[res] };
        }
      });
      return res;
    });
    console.log(history, "his");
    return history;
  }
};