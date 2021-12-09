plugins {
    id("java")
    id("war")
    id("org.jbake.site") version "5.5.0"
    id("org.gretty") version "4.0.0"
    id("org.ajoberstar.git-publish") version "3.0.0"
}

val javaVersion = JavaVersion.VERSION_17
val outputDir = "${buildDir}/jbake"

gitPublish {
    repoUri.set("https://github.com/jdpgrailsdev/blog.git")
    branch.set("gh-pages")

    contents {
        from(projectDir) {
            include("CNAME")
        }
        from(file(outputDir)) {
            into(".")
        }
    }

    commitMessage.set("Updating site.")
}

gretty {
    inplaceMode = "soft"
    httpPort = 8820
    contextPath = "/"
}

java {
    sourceCompatibility = javaVersion
    targetCompatibility = javaVersion
}

jbake {
    clearCache = true
    asciidoctorjVersion = "2.5.2"
    freemarkerVersion = "2.3.31"
    pegdownVersion = "1.6.0"
    version = "2.6.7"
}

repositories {
    mavenLocal()
    mavenCentral()
    jcenter()
}

tasks.register<Copy>("copyContent") {
    from(outputDir)
    into("${buildDir}/inplaceWebapp")
}

tasks.register("publish") {}

// Task Dependencies
tasks.named("build") {
    dependsOn("bake")
}
tasks.named("copyContent") {
    dependsOn("bake")
}
tasks.named("publish") {
    dependsOn(listOf("build", "gitPublishPush"))
}
tasks.named("gitPublishCopy") {
    dependsOn("bake")
}
tasks.named("gitPublishPush") {
    outputs.upToDateWhen { false }
}

allprojects {
    afterEvaluate {
        // Re-generate content using JBake before launching the local Jetty server.
        tasks.named("jettyRun") {
            dependsOn("copyContent")
        }
    }
}