package dto;

import java.util.List;

public class CompanyDTO extends DTO {
  public String id;
  public String name;
  public String address;
  public String city;
  public String country;
  public String email;
  public String phone;
  public List<BeneficiaryDTO> beneficiaries;
}
