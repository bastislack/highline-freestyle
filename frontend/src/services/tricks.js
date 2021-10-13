import http from "../http-common.js"

class TricksDataService {
  getAll() {
    return http.get("tricks");
  }

  create(trick) {
    return http.post("tricks/create", trick);
  }
  
  get(id) {
    return http.get(`tricks/id/${id}`);
  }

  update(id, trick) {
    return http.put(`tricks/id/${id}`, trick);
  }

  delete(id) {
    return http.delete(`tricks/id/${id}`);
  }
}

export default new TricksDataService();
