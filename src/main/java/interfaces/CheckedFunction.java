package interfaces;

@FunctionalInterface
public interface CheckedFunction<R> {
   R apply() throws Exception;
}