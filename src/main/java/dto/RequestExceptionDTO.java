package dto;

import java.util.List;

import model.RequestException;

public class RequestExceptionDTO {
  String message;
  List<String> messages;
  Boolean success = false;
  public RequestExceptionDTO(Exception exception) {
    message = exception.getMessage();
  }
  public RequestExceptionDTO(RequestException exception) {
    this((Exception)exception);
    messages = exception.getMessages();
  }
}
