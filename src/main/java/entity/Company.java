package entity;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;

import annotation.Skip;

import com.j256.ormlite.dao.ForeignCollection;
import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.field.ForeignCollectionField;
import com.j256.ormlite.table.DatabaseTable;

@DatabaseTable(tableName = "companies")
public class Company {
  @DatabaseField(id = true, canBeNull=false)
  private String id;
  @DatabaseField
  Timestamp createdAt;
  @DatabaseField(canBeNull = false)
  private String name;
  @DatabaseField(canBeNull = false)
  private String address;
  @DatabaseField(canBeNull = false)
  private String city;
  @DatabaseField(canBeNull = false)
  private String country;
  @DatabaseField(canBeNull = true)
  private String email;
  @DatabaseField(canBeNull = true)
  private String phone;
  @Skip
  @ForeignCollectionField
  ForeignCollection<Beneficiary> beneficiaries;
  public void setCreatedAt() {
    createdAt = new Timestamp(new Date().getTime());
  }
  public ArrayList<Beneficiary> getBeneficiaries() {
    return new ArrayList<Beneficiary>(beneficiaries);
  }
}
