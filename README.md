# **Telefon Rehberi**

**Telefon Rehberi**; şirket içerisindeki pozisyonların ve şirket hiyerarşisinin görüntülenebildiği bir uygulamadır. Bu uygulamada yer alan admin ve user rolleri ile farklı işlemler yapılabilmektedir. Admin panelde şirket pozisyonları güncellenebilir, pozisyon bilgisinin kullanıcıya görünüp olup olmayacağı seçilebilir ve abonelik türü işlemleri gerçekleştirilebilir.

Sayfasının sol tarafında yer alan ağaçtan şirket içerisindeki pozisyonlar listelenmektedir. Ağacın üst kısmında bulunan arama çubuğu sayesinde pozisyon isminde arama yapabilirsiniz. Görüntülemek istediğiniz pozisyona tıkladığınızda sağ taraftaki panelde pozisyon bilgileri detaylı bir şekilde görüntülenir. Pozisyonların Adı, Sabit Numara ,IP Numara , Posta Kutusu , Görünürlük , Abonelik Türü bilgileri sistemde yer almaktadır. Admin panelinde yer alan "Güncelle" butonu ile açılan form üzerinden pozisyonunun bilgilerini güncelleyebilirsiniz. Görünürlük checkboxı seçildiğinde pozisyon "Görünür" duruma gelir , eğer checkbox işaretlenmezse pozisyon "Gizli" durumuna gelir. Gizli durumundaki pozisyonlar user panelde listelenmez.

Dinamik kolon yönetimi yapabilirsiniz.Sayfanın sağ üstünde yer alan Dinamik Kolon Yönetimi sayfasından ihtiyacınıza göre yeni bir kolon ekleyebilir veya silebilirsiniz, kolon ismini değiştirebilirsiniz. 

Sayfanın sağ üstünde yer alan "Veritabanını Yedekle" ve "Veritabanını Geri Yükle" butonları ile veraitabanının backup'ını alıp restore edebilirsiniz. Admin panelde yer alan "Abonelik Yönetimi" butonu ile birlikte abonelik türlerinin ekleme, güncelleme ve silme işlemlerini gerçekleştirebilirsiniz.

Projede backup mekanizması bulunmaktadır. Her gün sistemin backup dosyası alınmaktadır. 7 gün öncesine ait backup dosyaları da silinmektedir. backend/api/db/backup_db.py yolundaki backup_db.py dosyasından bu mekanizmayı inceleyebilirsiniz.

## Dikkat Edilmesi Gerekenler

telefon-rehberi/kubernetes/frontend/env dosyası içerisinde yer alan değişkenleri kullanmak istediğiniz değişken adına göre değiştirebilirsiniz.

telefon-rehberi/kubernetes/data/.env dosyasındaki SERVICE_URL ifadesini verileri alacağınız servisin urli ile değiştirilmesi gerekmektedir,

Tarayıcınızdan "http://{minikube ip}:FRONTEND_NODE_PORT/login" adresine gidin. Açılan login sayfasında admin olarak giriş yapmak istenildiğinde kullanıcı adı "admin" , şifre "12345678" olacak şekilde bilgileri ile admin olarak giriş yapabilirsiniz. Kullanıcı olarak giriş yapmak istediğinizde ise kullanıcı oluşturarak giriş yapabilirsiniz.

Kurulum sırasında servisten okunup veritabanına kaydedilen pozisyon bilgilerine default olarak abonelik türü "1"(substype1) ve görünürlük bilgisi "Görünür" olarak insert edilmektedir.

telefon-rehberi/.env dosyasındaki SERVICE_URL ifadesini pozisyon bilgilerini alacağınız url adresi ile değiştirildiğinden emin olunuz. Gelen veri formatı aşağıdaki gibi olmalıdır. telefon-rehberi/service/app.py dosyasından verilerin serviceden alınıp veritabanına yazılma işlemleri gerçekleşmektedir.

[
{
"ad": "CEO",
"ataId": null,
"hiyerAd": "CEO",
"hiyerId": "1",
"id": 1
},
{
"ad": "CFO",
"ataId": 1,
"hiyerAd": "CEO/CFO",
"hiyerId": "1.1",
"id": 2
},
{
"ad": "CTO",
"ataId": 1,
"hiyerAd": "CEO/CTO",
"hiyerId": "1.2",
"id": 3
}
]

### Gereksinimlerin Kurulumu

1.  **Docker Kurulumu:**

    Docker'ı sisteminize kurmak için [Docker'ın resmi sitesindeki](https://docs.docker.com/get-docker/) talimatları izleyin. Kurulum tamamlandıktan sonra, Docker'ın çalıştığını doğrulamak için terminalden şu komutu çalıştırabilirsiniz:

    ```bash
    docker --version
    ```

2.  **Minikube Kurulumu:**

    Minikube, Kubernetes cluster'ını yerel olarak çalıştırmanızı sağlar. Minikube'u kurmak için aşağıdaki adımları izleyin:

    - Linux için Minikube'u indirin ve yükleyin:

      ```bash
      curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64 \
      && sudo install minikube-linux-amd64 /usr/local/bin/minikube
      ```

    - Minikube'u başlatın:

      ```bash
      minikube start --driver=kvm2
      ```

      ### Eğer `minikube start --driver=kvm2` ile başlatamazsanız:

      1. **KVM ve libvirt kurulumunu doğrulayın:**

      ```bash
      sudo apt update
      sudo apt install qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils
      sudo systemctl enable libvirtd
      sudo systemctl start libvirtd
      ```

      2. **Kullandığınız kullanıcıyı `libvirt` grubuna ekleyin:**

      ```bash
      sudo usermod -aG libvirt $(whoami)
      newgrp libvirt
      ```

      3. **KVM'nin etkin olup olmadığını kontrol edin:**

      ```bash
      kvm-ok
      ```

      4. **Daha sonra tekrar çalıştırmayı deneyin**

      ```bash
      minikube start --driver=kvm2
      ```

    - Docker'ı Minikube ile kullanmak için aşağıdaki komutu çalıştırın:

      ```bash
      eval $(minikube -p minikube docker-env)
      ```

3.  **kubectl Kurulumu:**

    Kubernetes cluster'ınızı yönetmek için kubectl aracını kullanmanız gerekmektedir. Kubectl'i kurmak için aşağıdaki adımları izleyin:

    - Linux için kubectl'i indirin ve yükleyin:

      ```bash
      curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
      sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
      ```

    - Kurulumu doğrulamak için:

      ```bash
      kubectl version --client
      ```
      
### Projeyi Çalıştırma

Projeyi Kubernetes üzerinde çalıştırmak için aşağıdaki adımları takip edin:

1. **Docker İmajlarını Oluşturun:**

Proje dizininde, Dockerfile'ları kullanarak gerekli Docker imajlarını oluşturun. Örneğin:

   ```bash
  docker build -t rehber-backend:v.10.09.24.1 -f ./backend/Dockerfile .

  docker build -t rehber-frontend:v.10.09.24.1 -f ./frontend/Dockerfile .

  docker build -t rehber-service:v.10.09.24.1 -f ./service/Dockerfile .

Oluşturduğunuz docker image'leri minikube içindeki docker ortamına yükleyin. Örneğin:

   ```bash
  docker save rehber-backend:v.10.09.24.1 | (eval $(minikube docker-env) && docker load)
  docker save rehber-frontend:v.10.09.24.1 | (eval $(minikube docker-env) && docker load)
  docker save rehber-service:v.10.09.24.1 | (eval $(minikube docker-env) && docker load)
   ```

2. **Kubernetes Yapılandırmalarını Uygulayın:**

   Her bir servis için ilgili `.env` dosyasını yükleyerek Kubernetes deployment ve service'lerini oluşturun.

   Lütfren aşağıdaki sırada oluşturunuz.

 **Backend Servisini Çalıştırmak için:**

     ```bash
    export $(cat kubernetes/backend/.env | xargs) # Ortam değişkenlerini yükleyin
    envsubst < kubernetes/backend/backend-pvc.yaml | kubectl apply -f -
    envsubst < kubernetes/backend/backend-deployment.yaml | kubectl apply -f -
    envsubst < kubernetes/backend/backend-service.yaml | kubectl apply -f -
     ```

   - **Frontend Servisini Çalıştırmak için:**

     ```bash
      export $(cat kubernetes/frontend/.env | xargs) # Ortam değişkenlerini yükleyin
      envsubst < kubernetes/frontend/frontend-deployment.yaml | kubectl apply -f -
      envsubst < kubernetes/frontend/frontend-service.yaml | kubectl apply -f -
     ```
     
   - **Data Servisini Çalıştırmak için:**

     ```bash
      export $(cat kubernetes/data/.env | xargs) # Ortam değişkenlerini yükleyin
      envsubst < kubernetes/data/data-deployment.yaml | kubectl apply -f -
      envsubst < kubernetes/data/data-service.yaml | kubectl apply -f -
     ```
3. **Servislerin Durumunu Kontrol Edin:**

   Kubernetes üzerinde servislerin durumunu kontrol etmek için:

   ```bash
   kubectl get pods
   kubectl get services
   ```

   Bu komutlar, tüm pod'ların ve servislerin doğru bir şekilde çalışıp çalışmadığını gösterecektir.

4. **Servislere Erişim:**

   Minikube ile yerel olarak çalışan servislere erişmek için `minikube service` komutunu kullanabilirsiniz. Örneğin, API servisine erişmek için:

   ```bash
   minikube service api-service
   ```

5. **Logları İnceleyin:**

   Herhangi bir sorunla karşılaşırsanız, pod loglarını incelemek için:

   ```bash
   kubectl logs <pod-name>
   ```

  kubectl delete deployment --all
   kubectl delete service --all
   kubectl delete pvc --all