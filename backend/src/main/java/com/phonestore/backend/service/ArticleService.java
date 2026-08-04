package com.phonestore.backend.service;

import com.phonestore.backend.entity.Article;
import com.phonestore.backend.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ArticleService {
    private final ArticleRepository repository;

    public List<Article> getAll() {
        return repository.findAll();
    }

    public Article getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Article not found"));
    }

    public Article create(Article article) {
        return repository.save(article);
    }

    public Article update(Long id, Article article) {
        article.setId(id);
        return repository.save(article);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
