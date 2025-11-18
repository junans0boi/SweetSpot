package com.hollywood.sweetspot.config.datasource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.autoconfigure.orm.jpa.JpaProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
        // ✅ [수정] PlaceRepository가 있는 패키지를 스캔하도록 변경
        basePackages = "com.hollywood.sweetspot.place.repository",
        entityManagerFactoryRef = "domainEntityManagerFactory",
        transactionManagerRef = "domainTransactionManager"
)
public class DomainDataSourceConfig {

    @Bean(name = "domainProperties")
    @ConfigurationProperties(prefix = "datasources.domain")
    public DataSourceProperties domainDataSourceProperties() {
        return new DataSourceProperties();
    }

    // ✅ [신규] datasources.domain.jpa.* 를 매핑할 전용 JpaProperties
    @Bean(name = "domainJpaProperties")
    @ConfigurationProperties(prefix = "datasources.domain.jpa")
    public JpaProperties domainJpaProperties() {
        return new JpaProperties();
    }

    @Bean(name = "domainDataSource")
    public DataSource domainDataSource(@Qualifier("domainProperties") DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder().build();
    }

    @Bean(name = "domainEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean domainEntityManagerFactory(
            EntityManagerFactoryBuilder builder, 
            @Qualifier("domainDataSource") DataSource dataSource,
            @Qualifier("domainJpaProperties") JpaProperties jpaProps // ✅ 주입
    ) {
        return builder
                .dataSource(dataSource)
                // ✅ [수정] Place 엔티티가 있는 패키지로 변경
                .packages("com.hollywood.sweetspot.place.model")
                .persistenceUnit("domain")
                .properties(jpaProps.getProperties()) // ✅ JPA 속성 주입
                .build();
    }

    @Bean(name = "domainTransactionManager")
    public PlatformTransactionManager domainTransactionManager(
            @Qualifier("domainEntityManagerFactory") LocalContainerEntityManagerFactoryBean entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory.getObject());
    }
}
