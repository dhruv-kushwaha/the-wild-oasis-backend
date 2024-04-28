import { Request } from "express";

// interface SelectObject {
//   select: filterObject;
// }

// type filterObject = Record<
//   string,
//   boolean | Record<string, Record<string, true>>
// >;

export function filterQuery(req: Request) {
  const fieldsStr = req.query.fields;

  const limitFields = {} as any;
  // name,age,cabin.id,cabin.location,guest.name,guest.age
  if (typeof fieldsStr === "string") {
    const fields = fieldsStr.split(",");

    for (const field of fields) {
      if (field.includes(".")) {
        const [relation, relationField] = field.split(".");
        if (limitFields[relation] === undefined) {
          const selectObject = {
            select: {
              [relationField]: true,
            },
          };
          limitFields[relation] = selectObject;
        } else {
          limitFields[relation]["select"][relationField] = true;
        }
      } else {
        limitFields[field] = true;
      }
    }

    return limitFields;
  }

  return null;

  // fields[_bookings]="name,age,createdAt,guest[guestName,guestAge],"
  // fields[guest]="guestName,guestAge"
  // [
  //   'createdAt,startDate,endDate,numNights',
  //   { guest: 'fullName,email' }
  // ]
  // createdAt,startDate,endDate,
  // { guest: 'fullName,email' }
  // const limitFields = {} as Record<
  //   string,
  //   true | Record<string, Record<string, true>>
  // >;
  // console.log(req.query.fields);
  // if (req.query.fields) {
  //   // Model level fields
  //   if (typeof req.query.fields === "string") {
  //     const fields = (req.query.fields as string).split(",");
  //     fields.forEach((field) => {
  //       limitFields[field] = true;
  //     });
  //   } else if (typeof req.query.fields === "object") {
  //     // console.log("Object hai");
  //     // Model level + RELATION FIELDS
  //     if (req.query.fields instanceof Array) {
  //       console.log("ARRAY");
  //       req.query.fields.forEach((query) => {
  //         if (typeof query === "string") {
  //           const fields = (query as string).split(",");
  //           fields.forEach((field) => {
  //             limitFields[field] = true;
  //           });
  //         }
  //         // RELATIONAL FIELDS
  //         else if (query instanceof Object) {
  //           Object.entries(query).forEach(([key, value]) => {
  //             console.log(key, value);
  //             const subFields = {} as Record<string, true>;
  //             const fields = (value as string).split(",");
  //             fields.forEach((field) => {
  //               subFields[field] = true;
  //             });
  //             const selectFields = {} as { select: Record<string, true> };
  //             selectFields["select"] = subFields;
  //             limitFields[key] = selectFields;
  //           });
  //         }
  //       });
  //     }
  //     // RELATION FIELDS ONLY
  //     else if (req.query.fields instanceof Object) {
  //       // console.log("LAST");
  //       Object.entries(req.query.fields).forEach(([key, value]) => {
  //         const subFields = {} as Record<string, true>;
  //         const fields = (value as string).split(",");
  //         fields.forEach((field) => {
  //           subFields[field] = true;
  //         });
  //         const selectFields = {} as { select: Record<string, true> };
  //         selectFields["select"] = subFields;
  //         limitFields[key] = selectFields;
  //       });
  //     }
  //   }
  // } else {
  //   return null;
  // }
  // return limitFields;

  console.log(req.query.fields);
  // const limitFields = {} as {} as Record<
  //   string,
  //   true | Record<string, Record<string, true>>
  // >;
  // if (typeof req.query.fields === "string") {
  //   const fields = req.query.fields.split(",");
  //   fields.forEach((field) => {
  //     if (field.includes("[")) {
  //       const [relation, rawValue] = field.split("[");
  //       const value = rawValue.split("]").at(0);
  //       const relationFields = value?.split(";");
  //     }
  //   });
  // }
}

function sortQuery(
  // sortString: Record<string, string | Record<string, string>>,
  sortString: string,
  sortObj: Record<string, boolean | Record<string, boolean>>
) {
  // const firstLevel = sortString.split(",");
  // for (let i = 0; i < firstLevel.length; i++) {
  //   if (firstLevel[i].includes("[")) {
  //     const [key, firstSubKey] = firstLevel[i].split("[");
  //     const subObject = {} as Record<string, "asc" | "desc">;
  //     const direction = firstSubKey.includes("-") ? "desc" : "asc";
  //     const subKey =
  //       direction === "desc"
  //         ? (firstSubKey.split("-").at(0) as string)
  //         : firstSubKey;
  //     subObject[subKey] = direction;
  //     while (!firstLevel[i].includes("]")) {
  //       const firstSubKey = firstLevel[i];
  //       const direction = firstSubKey.includes("-") ? "desc" : "asc";
  //       const subKey =
  //         direction === "desc"
  //           ? (firstSubKey.split("-").at(0) as string)
  //           : firstSubKey;
  //       subObject[subKey] = direction;
  //       i++;
  //     }
  //     if()
  //   }
  // }
  // if(){}
  // for (const [key, value] of Object.entries(sort)) {
  //   if (value === "asc" || value === "desc") {
  //   }
  //   if (typeof value === "object") {
  //     sortQuery({ key: value }, sortObj);
  //   }
  // }
}
