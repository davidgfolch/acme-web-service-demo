package util;

import spark.ResponseTransformer;
import annotation.Skip;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;

import dto.CompanyDTO;
import dto.RequestDTO;

public class JsonUtil {
  private static Gson gson = new GsonBuilder().setExclusionStrategies(
      new com.google.gson.ExclusionStrategy() {  
        public boolean shouldSkipField(com.google.gson.FieldAttributes field) {  
          if (field.getAnnotation(Skip.class) != null) {
            return true;
          }
          return false;
        }  
        public boolean shouldSkipClass(Class<?> arg0) {  
          return false;  
        }  
      }).create();  
  public static String toJson(Object object) {
    return gson.toJson(object);
  }
  public static CompanyDTO fromJson(String json) {
    return gson.fromJson(json, CompanyDTO.class);
  }
  public static <T> T fromJson(String json, Class<T> klass) {
    return gson.fromJson(json, klass);
  }
  public static CompanyDTO fromRequest(String request) {
    return gson.fromJson(request, RequestDTO.class).data;
  }
  public static JsonObject toJsonObject(Object object) {
    return gson.toJsonTree(object).getAsJsonObject();
  }
  public static ResponseTransformer json() {
    return gson::toJson;
  }
}
