package acme;


import spark.Filter;
import spark.Request;
import spark.Response;
import spark.Spark;
import static spark.Spark.exception;
import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.put;
import static spark.Spark.port;

import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;

import interfaces.CheckedFunction;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.Callable;
import java.util.stream.Collectors;

import com.j256.ormlite.db.DatabaseType;
import com.j256.ormlite.db.DerbyEmbeddedDatabaseType;
import com.j256.ormlite.db.PostgresDatabaseType;
import com.j256.ormlite.jdbc.JdbcConnectionSource;
import com.j256.ormlite.misc.TransactionManager;
import com.j256.ormlite.support.ConnectionSource;

import dto.BeneficiaryDTO;
import dto.CompanyDTO;
import dto.RequestExceptionDTO;
import dto.SuccessDTO;
import entity.Company;
import model.RequestException;
import static util.JsonUtil.fromJson;
import static util.JsonUtil.fromRequest;
import static util.JsonUtil.toJson;
import static util.JsonUtil.json;
import service.AcmeService;

public class Acme {
  static ConnectionSource source;
  static final Logger logger = Logger.getLogger(Acme.class);
  static final String INCORRECT_REQUEST_FORMAT="Format incorrect: expected {..., data: [COMPANY DETAILS], ...}";
  private static CompanyDTO getDto(Request req) throws RequestException {
    CompanyDTO dto;
    try {
      dto = fromRequest(req.body());  
      if (dto == null) {
        throw new Exception(INCORRECT_REQUEST_FORMAT);
      }
    } catch(Exception exception) {
      exception.printStackTrace();
     logger.error("Request format incorrect:\n\n" + req.body());
      throw new RequestException(INCORRECT_REQUEST_FORMAT);
    }
    return dto;
  }
  private static CompanyDTO toDto(Company company) {
    CompanyDTO dto = fromJson(toJson(company));
    dto.beneficiaries = company.getBeneficiaries().stream()
        .map(BeneficiaryDTO::new)
        .collect(Collectors.toList());
    return dto;
  }
  private static SuccessDTO toSuccessDTO(Object data) {
    return new SuccessDTO(data);
  }
  private static List<CompanyDTO> toDto(List<Company> companies) {
    return companies.stream()
        .map(company -> toDto(company))
        .collect(Collectors.toList());
  }
  private static final HashMap<String, String> corsHeaders = new HashMap<String, String>();
  
  static {
      corsHeaders.put("Access-Control-Allow-Methods", "GET,PUT,POST,OPTIONS");
      corsHeaders.put("Access-Control-Allow-Origin", "*");
      corsHeaders.put("Access-Control-Allow-Headers",  "Origin, x-requested-with, Content-Type, content-type, Accept");
      corsHeaders.put("Access-Control-Allow-Credentials", "false");
  }

  public final static void corsFilter() {
      Filter filter = new Filter() {
          @Override
          public void handle(Request request, Response response) throws Exception {
              corsHeaders.forEach((key, value) -> {
                  response.header(key, value);
              });
          }
      };
      Spark.after(filter);
  }
  
  private static ConnectionSource getSource() {
    return Acme.source;
  }
  private static void transaction(CheckedFunction<Void> action) throws Exception {
    TransactionManager.callInTransaction(
        getSource(), 
        new Callable<Void>() {
          public Void call() throws Exception {
             action.apply();          
            return null;
          }   
        });
  }

  public static void main(String[] args) throws Exception {
    PropertyConfigurator.configure(Acme.class.getResource("/log4j.properties"));

    Acme.source = getDatabaseConnection();
    
    AcmeService acmeService = AcmeService.getInstance(getSource());      

    Spark.staticFileLocation("/public"); 

    port(getHerokuAssignedPort());

    corsFilter();
    
    post("/companies", 
        (req, res) -> {
          CompanyDTO dto = getDto(req); 
          CheckedFunction<Void> action = new CheckedFunction<Void>() {
            @Override
            public Void apply() throws Exception {
              acmeService.createCompany(dto);
              return null;
            }
          };
          transaction(action);
          return new SuccessDTO();
        }, json());



    get("/companies", 
        (req, res) -> toSuccessDTO(toDto(acmeService.getCompanies())), json());

    get("/companies/:id", 
        (req, res) -> toSuccessDTO(toDto(acmeService.getCompany(req.params("id")))), json());

    put("/companies", 
        (req, res) -> { 
          CompanyDTO dto = getDto(req); 
          CheckedFunction<Void> action = new CheckedFunction<Void>() {
            @Override
            public Void apply() throws Exception {
              acmeService.updateCompany(dto);
              return null;
            }
          };
          transaction(action);
          return new SuccessDTO();
        }, json());

    exception(RequestException.class, (exception, req, res) -> {
      processRequestException((RequestException)exception, req, res);
    });
    exception(SQLException.class, (exception, req, res) -> {
      Throwable rootCause = exception.getCause();
      if (rootCause instanceof RequestException) {
        processRequestException((RequestException)rootCause, req, res); 
      } else {
        exception.printStackTrace();
        res.status(500);
        res.body(toJson(new RequestExceptionDTO(exception)));
      }
    });
  }
 static void processRequestException(RequestException exception, Request req, Response res) {
   res.status(exception.getStatus());
   res.body(toJson(new RequestExceptionDTO(exception)));
  }
  static Properties getProperties() throws IOException {
    Properties prop = new Properties();
    InputStream in = Acme.class.getResourceAsStream("/app.properties");
    prop.load(in);
    in.close();
    return prop;
  }
  static ConnectionSource getDatabaseConnection() throws Exception {
    Properties prop = new Properties();
    try {
      prop = getProperties();
    } catch (IOException e) {
      e.printStackTrace();
    }
    String dbEnvUrl = System.getenv("DATABASE_URL");
    if (dbEnvUrl == null) {
      Boolean useDerby = prop.getProperty("use.derby").equals("true");
      if (useDerby) {
        String databaseUrl = "jdbc:derby:ormlitederby;create=true";
        DatabaseType databaseType = new DerbyEmbeddedDatabaseType();
        return new JdbcConnectionSource(databaseUrl, databaseType);
      }
      dbEnvUrl = prop.getProperty("db.url");
    }
    URI dbUri = null;
    dbUri = new URI(dbEnvUrl);
    String username = dbUri.getUserInfo().split(":")[0];
    String password = dbUri.getUserInfo().split(":")[1];
    String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + dbUri.getPath();
    DatabaseType dbType = new PostgresDatabaseType();
    ConnectionSource source = null;
    source = new JdbcConnectionSource(dbUrl,username, password, dbType);
    return source;
  }
  static int getHerokuAssignedPort() {
    ProcessBuilder processBuilder = new ProcessBuilder();
    if (processBuilder.environment().get("PORT") != null) {
      return Integer.parseInt(processBuilder.environment().get("PORT"));
    }
    return 4567; 
  }

}