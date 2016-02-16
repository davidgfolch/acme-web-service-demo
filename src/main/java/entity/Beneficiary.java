package entity;

import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;

@DatabaseTable(tableName = "beneficiaries")
public class Beneficiary {
  @DatabaseField(generatedId = true)
  private Integer id;
  @DatabaseField(canBeNull = false)
  private String name;
  public Integer getId() {
    return id;
  }
  public void setId(Integer id) {
    this.id = id;
  }
  public String getName() {
    return name;
  }
  @DatabaseField(foreign = true, foreignAutoRefresh = true)
  private Company company; 
  
  public Beneficiary() {}
  public Beneficiary(String name, Company company) {
    this.name = name;
    this.company = company;
  }
  public Beneficiary(Integer id, String name, Company company) {
    this.id = id;
    this.name = name;
    this.company = company;       
  }
}
