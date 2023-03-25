import MainDatabase from "./mainDatabase";
// @ts-ignore
import IDBExportImport from "indexeddb-export-import";
import fileDownload from "js-file-download";

export class DatabaseSerializer {
  public constructor(private db: MainDatabase) {}

  public async exportDatabase() {
    await this.db.open();
    const idbDatabase = this.db.backendDB(); // get native IDBDatabase object from Dexie wrapper

    return await new Promise((res, rej) => {
      IDBExportImport.exportToJsonString(idbDatabase, (err: any, jsonString: string) => {
        if (err) {
          rej(err);
        }
        console.log("Exported as json", jsonString);
        const date = new Date();
        res(
          fileDownload(jsonString, "highline-freestyle.com-" + date.toLocaleDateString().replaceAll("/", "-"), ".json")
        );
      });
    });
  }

  // TODO: This is copied over from the JS implementation.
  public async importDatabase(data: any) {
    await this.db.open();
    const idbDatabase = this.db.backendDB();

    return await new Promise<void>((res, rej) => {
      IDBExportImport.clearDatabase(idbDatabase, function (err: any) {
        if (err) {
          rej(err);
          return;
        }
        IDBExportImport.importFromJsonString(idbDatabase, data, function (err: any) {
          if (err) {
            rej(err);
            return;
          }
          res();
        });
      });
    });
  }
}
