//package com.hollywood.sweetspot.config.datasource;
//
//import org.springframework.beans.factory.annotation.Qualifier;
//import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
//import org.springframework.boot.context.properties.ConfigurationProperties;
//import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
//import org.springframework.orm.jpa.JpaTransactionManager;
//import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
//import org.springframework.transaction.PlatformTransactionManager;
//import org.springframework.transaction.annotation.EnableTransactionManagement;
//
//import javax.sql.DataSource;
//
//@Configuration
//@EnableTransactionManagement
//@EnableJpaRepositories(
//        // 🔻 앞으로 장소(Place) 관련 Repository는 여기에!
//        basePackages = "com.hollywood.sweetspot.user",
//        entityManagerFactoryRef = "domainEntityManagerFactory",
//        transactionManagerRef = "domainTransactionManager"
//)
//public class DomainDataSourceConfig {
//
//    @Bean(name = "domainProperties")
//    @ConfigurationProperties(prefix = "datasources.domain")
//    public DataSourceProperties domainDataSourceProperties() {
//        return new DataSourceProperties();
//    }
//
//    @Bean(name = "domainDataSource")
//    public DataSource domainDataSource(@Qualifier("domainProperties") DataSourceProperties properties) {
//        return properties.initializeDataSourceBuilder().build();
//    }
//
//    @Bean(name = "domainEntityManagerFactory")
//    public LocalContainerEntityManagerFactoryBean domainEntityManagerFactory(EntityManagerFactoryBuilder builder, @Qualifier("domainDataSource") DataSource dataSource) {
//        return builder
//                .dataSource(dataSource)
//                // 🔻 앞으로 장소(Place) 관련 Entity는 여기에!
//                .packages("com.hollywood.sweetspot.domain.model")
//                .persistenceUnit("domain")
//                .build();
//    }
//
//    @Bean(name = "domainTransactionManager")
//    public PlatformTransactionManager domainTransactionManager(@Qualifier("domainEntityManagerFactory") LocalContainerEntityManagerFactoryBean entityManagerFactory) {
//        return new JpaTransactionManager(entityManagerFactory.getObject());
//    }
//}
