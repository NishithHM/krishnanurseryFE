import React from "react";
import Dropdown from "../Dropdown";
import { formatDropOptions } from "../../pages/AddNewVariants/helper";
import { GrTrash } from "react-icons/gr";
import Button from "../Button";
const AddNewVariantsSelect = ({
  typeOptionsValues,
  type,
  typeValues,
  onTypeChange,
  index,
  typeOptionOptions,
  deleteTypeHandler,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "20px",
        maxWidth: "60rem",
        justifyContent: "stretch",
        margin: "10px 0",
      }}
    >
      <div style={{ maxWidth: "20rem", flex: 1 }}>
        <Dropdown
          canCreate={true}
          data={formatDropOptions(typeOptionsValues)}
          value={{ label: type, value: type }}
          onChange={(e) =>
            onTypeChange({
              index,
              value: e.label,
              isNew: false,
              category: "type",
            })
          }
          onCreateOption={(e) =>
            onTypeChange({ index, value: e, isNew: true, category: "type" })
          }
        />
      </div>
      <div style={{ maxWidth: "40rem", flex: 3 }}>
        <Dropdown
          isMultiEnabled={true}
          isClearable
          isSearchable
          canCreate={true}
          onCreateOption={(e) =>
            onTypeChange({
              index,
              value: [...typeValues, e],
              isNew: true,
              category: "options",
            })
          }
          onChange={(e) =>
            onTypeChange({
              index,
              value: e?.map((ele) => ele.label),
              isNew: false,
              category: "options",
            })
          }
          data={formatDropOptions(typeOptionOptions)}
          value={formatDropOptions(typeValues)}
        />
      </div>
      <div>
        <Button
          type="alert"
          title={<GrTrash style={{ filter: "invert()" }} />}
          onClick={() => deleteTypeHandler(type)}
        />
      </div>
    </div>
  );
};

export default AddNewVariantsSelect;
