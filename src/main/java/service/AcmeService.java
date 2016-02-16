package service;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import util.JsonUtil;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.j256.ormlite.dao.Dao;
import com.j256.ormlite.dao.DaoManager;
import com.j256.ormlite.stmt.QueryBuilder;
import com.j256.ormlite.support.ConnectionSource;
import com.j256.ormlite.table.TableUtils;

import dto.BeneficiaryDTO;
import dto.CompanyDTO;
import entity.Beneficiary;
import entity.Company;
import model.RequestException;
public class AcmeService {
  Dao<Company, String> dao;
  Dao<Beneficiary, String> beneDao;
  private static AcmeService instance;
  public static AcmeService getInstance(ConnectionSource source) throws SQLException {
    if (instance == null) {
      Dao<Beneficiary, String> beneDao = DaoManager.createDao(source, Beneficiary.class);
      if (!beneDao.isTableExists()) {
        TableUtils.createTableIfNotExists(source, Beneficiary.class);
      }
      Dao<Company, String> dao = DaoManager.createDao(source, Company.class);
      if (!dao.isTableExists()){
        TableUtils.createTableIfNotExists(source, Company.class);
      }
      instance = new AcmeService(dao, beneDao); 
    }
    return instance;
  }
  public AcmeService(Dao<Company, String> dao, Dao<Beneficiary, String> beneDao) {
    this.dao = dao;
    this.beneDao = beneDao;
  }
  public Company getCompany(String id) throws Exception {
    Company company = dao.queryForId(id);
    if (company == null) {
      throw new RequestException("No company with id %s found", id);
    }
    return company;
  }

  public void createCompany(CompanyDTO dto) throws Exception {
    validate(dto);
    Boolean exists = dao.idExists(dto.id);
    if (exists) {
      throw new RequestException("Company with id %s already exists", dto.id);
    }
    Company company = JsonUtil.fromJson(dto.toJson(), Company.class);
    company.setCreatedAt();
    dao.create(company);
    for (BeneficiaryDTO beneDTO: dto.beneficiaries) {
      beneDao.create(new Beneficiary(beneDTO.name, company));
    }
  }

  public List<Company> getCompanies() throws Exception {
    QueryBuilder<Company, String> builder = dao.queryBuilder();
    return builder.orderBy("createdAt", false).query();
  }

  public void updateCompany(CompanyDTO dto) throws Exception {
    Company company = getCompany(dto.id);
    validate(dto);
    List<String> beneficiaryIds = company.getBeneficiaries()
        .stream()
        .map(beneficiary -> beneficiary.getId().toString()).collect(Collectors.toList());
    for (BeneficiaryDTO beneDTO: dto.beneficiaries) {
      Beneficiary bene = new Beneficiary(beneDTO.name, company);
      Integer id = beneDTO.id;
      if (id != null) {
        bene.setId(id);
        String idString = id.toString();
        if (!beneDao.idExists(idString)) {
          throw new RequestException("beneficiary with id %s does not exist", id);
        }
        beneDao.update(bene);
        beneficiaryIds.remove(idString);
      } else {
        beneDao.create(bene);
      }
    }
    if (beneficiaryIds.size() > 0) {
      beneDao.deleteIds(beneficiaryIds);
    }
    company = JsonUtil.fromJson(dto.toJson(), Company.class);
    dao.update(company);
  } 
  private void validate(CompanyDTO dto) throws RequestException {
    ArrayList<String> errors = new ArrayList<String>();
    List<String> required = Arrays.asList("id", "name", "address", "city", "country");
    JsonObject json = dto.toJsonObject();
    required.stream().forEach(
        (property) -> {
          JsonElement value = json.get(property);
          if (value == null) {
            errors.add(property + " field is required");
          }
        }
    );
    if (dto.beneficiaries == null || dto.beneficiaries.size() == 0) {
      errors.add("At least one beneficiary is required");
    }
    if (errors.size() > 0) {
      throw new RequestException(errors);
    }
  }
}
