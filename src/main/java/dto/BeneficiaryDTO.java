package dto;

import entity.Beneficiary;

public class BeneficiaryDTO {
  public Integer id;
  public String name;
  public BeneficiaryDTO(Beneficiary beneficiary) {
    id = beneficiary.getId();
    name = beneficiary.getName();
  }
}
