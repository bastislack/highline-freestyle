import http from "../http-common.js"

class CombosDataService {
  getAll() {
    return http.get("combos");
  }

  create(combo) {
    return http.post("combos/create", combo);
  }
  
  get(id) {
    return http.get(`combos/id/${id}`);
  }

  update(id, combo) {
    return http.put(`combos/id/${id}`, combo);
  }

  delete(id) {
    return http.delete(`combos/id/${id}`);
  }
}

export default new CombosDataService();
