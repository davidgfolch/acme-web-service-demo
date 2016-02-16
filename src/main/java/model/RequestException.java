package model;

import java.util.List;

public class RequestException extends Exception {
  private static final long serialVersionUID = 1L;
  private static final Integer BAD_REQUEST = 400; 
  private String message;
  private List<String> messages;
  private Integer status = BAD_REQUEST;
  public RequestException(List<String> messages) {
    this.messages = messages;
  }
  public RequestException(String message, Object... args) {
    this.message = String.format(message, args);
  }
  public RequestException(Exception e) {
    super(e);
  }
  public String getMessage() {
    return this.message;
  }
  public List<String> getMessages() {
    return this.messages;
  }
  public Integer getStatus() {
    return this.status;
  }
}
