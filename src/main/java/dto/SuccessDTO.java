package dto;

public class SuccessDTO {
  Boolean success = true;
  Object data;
  public SuccessDTO() {}
  public SuccessDTO(Object data) {
    this.data = data;
  }
}
