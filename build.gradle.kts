plugins {
    id("java")
    id("war")
    alias(libs.plugins.jbake.site)
    alias(libs.plugins.gretty)
    alias(libs.plugins.git.publish)
}

val javaVersion = JavaVersion.VERSION_21
val outputDir = layout.buildDirectory.dir("jbake")

configurations.all {
    // Force dependency versions in order to work on Apple M1
    resolutionStrategy.force(
        "org.jruby:jruby:${libs.versions.jruby.get()}",
        "net.java.dev.jna:jna:${libs.versions.jna.get()}",
        "com.github.jnr:jnr-posix:${libs.versions.jnr.posix.get()}",
        "com.github.jnr:jnr-constants:${libs.versions.jnr.constants.get()}",
        "com.github.jnr:jffi:${libs.versions.jffi.get()}",
        "commons-io:commons-io:${libs.versions.commons.io.get()}",
        "org.jbake:jbake-core:${libs.versions.jbake.get()}",
        "org.eclipse.jetty:jetty-server:${libs.versions.jetty.get()}")
}

gitPublish {
    repoUri.set("https://github.com/jdpgrailsdev/blog.git")
    branch.set("gh-pages")

    contents {
        from(projectDir) {
            include("CNAME")
        }
        from(outputDir.get()) {
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
    asciidoctorjVersion = libs.versions.asciidoctorj.get()
    freemarkerVersion = libs.versions.freemarker.get()
    pegdownVersion = libs.versions.pegdown.get()
    version = libs.versions.jbake.get()
}

repositories {
    mavenLocal()
    mavenCentral()
}

tasks.register<Copy>("copyContent") {
    from(outputDir.get())
    include("*", "**")
    into(layout.buildDirectory.dir("inplaceWebapp"))
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