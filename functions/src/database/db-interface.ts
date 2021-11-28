import { DbViewModel } from "../view-model/db-view-model";
import * as admin from "firebase-admin";

class DbInterface {
  get(params: DbViewModel, formatResultFn?: Function) {
    return params.reference.get().then((query: any) => {
      if (formatResultFn) {
        query = formatResultFn(query);
      }
      return query;
    });
  }

  post(params: DbViewModel, merge = true, verify?: Function) {
    return params.reference
      .set(params.setParams, { merge: merge })
      .then((res: any) => {
        if (verify) {
          res = verify(res);
        }
        return res;
      });
  }

  put(params: DbViewModel, verify?: Function) {
    return params.reference.update(params.setParams).then((res: any) => {
      if (verify) {
        res = verify(res);
      }
      return res;
    });
  }

  delete(params: DbViewModel, verify?: Function) {
    const deleteObject = {
      [`${params.setParams}`]: admin.firestore.FieldValue.delete(),
    };
    return params.reference.update(deleteObject).then((res: any) => {
      if (verify) {
        res = verify(res);
      }
      return res;
    });
  }
}

export const dataBase = new DbInterface();
