package dto;

import com.google.gson.JsonObject;

import util.JsonUtil;

public class DTO {
  public String toJson() {
    return JsonUtil.toJson(this);
  }
  public JsonObject toJsonObject() {
    return JsonUtil.toJsonObject(this);
  }
}
